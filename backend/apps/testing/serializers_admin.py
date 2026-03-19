from django.utils.text import slugify
from rest_framework import serializers
from .models import TestCategory, Question, Answer


class AdminCategorySerializer(serializers.ModelSerializer):
    class Meta:
        model = TestCategory
        fields = ['id', 'name', 'slug', 'order', 'question_count']
        read_only_fields = ['question_count']

    def validate_name(self, value):
        if not value.strip():
            return value
        qs = TestCategory.objects.filter(name=value)
        if self.instance:
            qs = qs.exclude(pk=self.instance.pk)
        if qs.exists():
            raise serializers.ValidationError('Категорія з такою назвою вже існує')
        return value

    def create(self, validated_data):
        if not validated_data.get('slug'):
            validated_data['slug'] = slugify(validated_data['name'], allow_unicode=True)
            base = validated_data['slug'] or 'category'
            slug = base
            n = 1
            while TestCategory.objects.filter(slug=slug).exists():
                slug = f'{base}-{n}'
                n += 1
            validated_data['slug'] = slug
        return super().create(validated_data)


class AdminAnswerSerializer(serializers.ModelSerializer):
    id = serializers.IntegerField(required=False)

    class Meta:
        model = Answer
        fields = ['id', 'text', 'is_correct', 'order']


class AdminQuestionListSerializer(serializers.ModelSerializer):
    category_name = serializers.CharField(source='category.name', read_only=True)
    answers_count = serializers.IntegerField(read_only=True)
    has_image = serializers.SerializerMethodField()

    class Meta:
        model = Question
        fields = ['id', 'number', 'text', 'image', 'category', 'category_name',
                  'answers_count', 'has_image']

    def get_has_image(self, obj):
        return bool(obj.image)


class AdminQuestionDetailSerializer(serializers.ModelSerializer):
    answers = AdminAnswerSerializer(many=True)
    category_name = serializers.CharField(source='category.name', read_only=True)
    number = serializers.IntegerField(required=False, allow_null=True)

    class Meta:
        model = Question
        fields = ['id', 'number', 'text', 'image', 'explanation', 'category',
                  'category_name', 'answers']

    def validate_answers(self, value):
        if len(value) < 2:
            raise serializers.ValidationError('Потрібно мінімум 2 варіанти відповіді')
        correct = [a for a in value if a.get('is_correct')]
        if not correct:
            raise serializers.ValidationError('Потрібна хоча б одна правильна відповідь')
        return value

    def create(self, validated_data):
        answers_data = validated_data.pop('answers')
        if 'number' not in validated_data or validated_data['number'] is None:
            max_num = Question.objects.order_by('-number').values_list('number', flat=True).first() or 0
            validated_data['number'] = max_num + 1
        question = Question.objects.create(**validated_data)
        for i, answer_data in enumerate(answers_data):
            answer_data.pop('id', None)
            answer_data['order'] = i
            Answer.objects.create(question=question, **answer_data)
        self._update_category_count(question.category)
        return question

    def update(self, instance, validated_data):
        answers_data = validated_data.pop('answers', None)
        old_category = instance.category

        for attr, val in validated_data.items():
            setattr(instance, attr, val)
        instance.save()

        if answers_data is not None:
            existing_ids = set(instance.answers.values_list('id', flat=True))
            incoming_ids = {a['id'] for a in answers_data if 'id' in a}
            # delete removed
            to_delete = existing_ids - incoming_ids
            if to_delete:
                Answer.objects.filter(id__in=to_delete).delete()
            # create or update
            for i, answer_data in enumerate(answers_data):
                aid = answer_data.pop('id', None)
                answer_data['order'] = i
                if aid and aid in existing_ids:
                    Answer.objects.filter(id=aid).update(**answer_data)
                else:
                    Answer.objects.create(question=instance, **answer_data)

        if old_category != instance.category:
            self._update_category_count(old_category)
            self._update_category_count(instance.category)

        return instance

    def _update_category_count(self, category):
        if category:
            category.question_count = category.questions.count()
            category.save(update_fields=['question_count'])


class BulkMoveSerializer(serializers.Serializer):
    question_ids = serializers.ListField(child=serializers.IntegerField())
    category_id = serializers.IntegerField()

    def validate_category_id(self, value):
        if not TestCategory.objects.filter(id=value).exists():
            raise serializers.ValidationError('Категорію не знайдено')
        return value


class BulkDeleteSerializer(serializers.Serializer):
    question_ids = serializers.ListField(child=serializers.IntegerField(), min_length=1)


class QuestionImageUploadSerializer(serializers.Serializer):
    image = serializers.ImageField()

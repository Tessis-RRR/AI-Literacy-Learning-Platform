from django.db import migrations, models
import django.contrib.postgres.fields


class Migration(migrations.Migration):

    dependencies = [
        ('LessonPlanHelper', '0003_simplify_schema'),
    ]

    operations = [
        # Remove old score columns
        migrations.RemoveField(model_name='promptsubmission', name='score_goal'),
        migrations.RemoveField(model_name='promptsubmission', name='score_context'),
        migrations.RemoveField(model_name='promptsubmission', name='score_task'),
        migrations.RemoveField(model_name='promptsubmission', name='score_constraints'),
        migrations.RemoveField(model_name='promptsubmission', name='score_output'),

        # Add new score columns
        migrations.AddField(model_name='promptsubmission', name='score_desired_results',
            field=models.IntegerField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='score_learner_context',
            field=models.IntegerField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='score_evidence_of_learning',
            field=models.IntegerField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='score_instructional_plan',
            field=models.IntegerField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='score_output_requirements',
            field=models.IntegerField(null=True, blank=True)),

        # Add new JSON feedback columns
        migrations.AddField(model_name='promptsubmission', name='strengths',
            field=models.JSONField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='priority_improvements',
            field=models.JSONField(null=True, blank=True)),
        migrations.AddField(model_name='promptsubmission', name='revision_feedback',
            field=models.JSONField(null=True, blank=True)),
    ]

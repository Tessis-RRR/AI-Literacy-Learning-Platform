from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('LessonPlanHelper', '0001_initial'),
    ]

    operations = [
        migrations.RunSQL(
            sql="""
            CREATE OR REPLACE VIEW pre_post_scores AS
            SELECT
                participant_id,
                MAX(CASE WHEN submission_type = 'pretest'  THEN total_score END) AS pretest_score,
                MAX(CASE WHEN submission_type = 'posttest' THEN total_score END) AS posttest_score,
                MAX(CASE WHEN submission_type = 'posttest' THEN total_score END)
                - MAX(CASE WHEN submission_type = 'pretest' THEN total_score END) AS score_gain
            FROM prompt_submissions
            GROUP BY participant_id;

            CREATE OR REPLACE VIEW fullpractice_trajectory AS
            SELECT
                participant_id,
                attempt_number,
                total_score,
                score_goal,
                score_context,
                score_task,
                score_constraints,
                score_output,
                submitted_at
            FROM prompt_submissions
            WHERE submission_type = 'fullpractice'
            ORDER BY participant_id, attempt_number;

            CREATE OR REPLACE VIEW avg_time_per_step AS
            SELECT
                step_type,
                ROUND(AVG(duration_seconds)) AS avg_seconds,
                COUNT(*)                     AS n_visits
            FROM step_times
            GROUP BY step_type
            ORDER BY avg_seconds DESC;

            CREATE OR REPLACE VIEW drag_drop_accuracy AS
            SELECT
                participant_id,
                COUNT(*)                                                          AS total_drops,
                SUM(CASE WHEN correct THEN 1 ELSE 0 END)                         AS correct_drops,
                SUM(CASE WHEN NOT correct THEN 1 ELSE 0 END)                     AS wrong_drops,
                ROUND(100.0 * SUM(CASE WHEN correct THEN 1 ELSE 0 END) / COUNT(*), 1) AS accuracy_pct
            FROM annotated_drops
            GROUP BY participant_id;
            """,
            reverse_sql="""
            DROP VIEW IF EXISTS pre_post_scores;
            DROP VIEW IF EXISTS fullpractice_trajectory;
            DROP VIEW IF EXISTS avg_time_per_step;
            DROP VIEW IF EXISTS drag_drop_accuracy;
            """,
        ),
    ]

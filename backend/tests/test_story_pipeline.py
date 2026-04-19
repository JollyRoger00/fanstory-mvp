import unittest

from app.domain.models import StoryState
from app.services.chapter_planner import ChapterPlan
from app.services.chapter_writer import ChapterWriterResult
from app.services.story_exceptions import StoryGenerationValidationError
from app.services.story_validation import validate_chapter_plan, validate_writer_result


class StoryPipelineValidationTests(unittest.TestCase):
    def test_invalid_planner_result_is_rejected(self) -> None:
        current_state = StoryState(
            chapter_number=1,
            current_state_summary="История только началась.",
            active_goals=[],
            unresolved_tensions=[],
            known_facts=[],
        )

        invalid_plan = ChapterPlan(
            target_chapter_number=3,
            scene_goal="Сцена",
            main_conflict="Конфликт",
            beat_outline=["Бит 1"],
            continuity_constraints=["Правило"],
            expected_state_delta="Состояние меняется",
            candidate_choices=[
                "Первый выбор",
                "Первый выбор",
                "Третий выбор",
            ],
        )

        with self.assertRaises(StoryGenerationValidationError):
            validate_chapter_plan(
                plan=invalid_plan,
                current_state=current_state,
                is_initial_chapter=False,
            )

    def test_invalid_writer_result_is_rejected(self) -> None:
        invalid_writer_result = ChapterWriterResult(
            chapter_title="Глава",
            chapter_text="Текст главы",
            choices=[
                "Одинаковый выбор",
                "Одинаковый выбор",
                "Третий выбор",
            ],
            state_summary="Новое состояние",
        )

        with self.assertRaises(StoryGenerationValidationError):
            validate_writer_result(invalid_writer_result)


if __name__ == "__main__":
    unittest.main()

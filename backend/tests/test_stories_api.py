import unittest
from unittest.mock import patch

from fastapi.testclient import TestClient

from app.dependencies import get_story_repository
from app.main import app
from app.repositories.memory import InMemoryStoryRepository
from app.services.chapter_planner import ChapterPlan
from app.services.chapter_writer import ChapterWriterResult


class StoryApiTests(unittest.TestCase):
    def setUp(self) -> None:
        self.repository = InMemoryStoryRepository()
        app.dependency_overrides[get_story_repository] = lambda: self.repository
        self.client = TestClient(app)

        self.create_planner_patcher = patch(
            "app.services.story_service.plan_next_chapter",
            return_value=ChapterPlan(
                target_chapter_number=1,
                scene_goal="Open the first mystery.",
                main_conflict="The protagonist must decide whether to take the risk.",
                beat_outline=[
                    "A strange sign appears.",
                    "The protagonist notices a hidden way forward.",
                    "The first serious decision arrives.",
                ],
                continuity_constraints=[
                    "Keep the mood atmospheric.",
                    "Stay inside the selected genre and tone.",
                ],
                expected_state_delta=(
                    "The protagonist discovers the first secret and now faces a risky next step."
                ),
                candidate_choices=[
                    "Enter the hidden passage right away",
                    "Find an ally before moving forward",
                    "Walk away and return later",
                ],
            ),
        )
        self.create_writer_patcher = patch(
            "app.services.story_service.write_chapter_from_plan",
            return_value=ChapterWriterResult(
                chapter_title="The Hidden Passage",
                chapter_text=(
                    "The protagonist notices a strange movement behind the wall and realizes "
                    "that a hidden passage has opened."
                ),
                choices=[
                    "Enter the hidden passage right away",
                    "Find an ally before moving forward",
                    "Walk away and return later",
                ],
                state_summary=(
                    "The protagonist has found a hidden passage and must decide how to respond."
                ),
            ),
        )
        self.create_planner_patcher.start()
        self.create_writer_patcher.start()

    def tearDown(self) -> None:
        self.create_planner_patcher.stop()
        self.create_writer_patcher.stop()
        app.dependency_overrides.clear()
        self.client.close()

    def create_story(self) -> dict:
        payload = {
            "universe": "Harry Potter",
            "protagonist": "A student near a hidden corridor",
            "theme": "A castle mystery",
            "genre": "Fantasy",
            "tone": "Atmospheric",
        }

        response = self.client.post("/stories", json=payload)

        self.assertEqual(response.status_code, 201)
        return response.json()

    def continuation_plan(self) -> ChapterPlan:
        return ChapterPlan(
            target_chapter_number=2,
            scene_goal="Push deeper into the mystery.",
            main_conflict="The protagonist senses another presence nearby.",
            beat_outline=[
                "The protagonist steps into the passage.",
                "Fresh evidence suggests someone else was here.",
                "The danger becomes more immediate.",
            ],
            continuity_constraints=[
                "Keep clear continuity with chapter one.",
                "Preserve the same atmosphere.",
            ],
            expected_state_delta=(
                "The protagonist enters the passage and discovers signs of another intruder."
            ),
            candidate_choices=[
                "Follow the footprints deeper underground",
                "Take the silver key from the floor",
                "Retreat before anyone notices",
            ],
        )

    def continuation_writer(self) -> ChapterWriterResult:
        return ChapterWriterResult(
            chapter_title="Dust and Footsteps",
            chapter_text=(
                "The passage descends into darkness, and in the dust the protagonist finds "
                "fresh footprints leading toward a locked door."
            ),
            choices=[
                "Follow the footprints deeper underground",
                "Take the silver key from the floor",
                "Retreat before anyone notices",
            ],
            state_summary=(
                "The protagonist is inside the passage and has proof that someone else was here."
            ),
        )

    def test_post_and_get_story_use_story_aggregate_shape(self) -> None:
        story = self.create_story()

        self.assertIn("story_id", story)
        self.assertIn("config", story)
        self.assertIn("current_state_summary", story)
        self.assertIn("chapters", story)
        self.assertIn("available_choices", story)
        self.assertIn("choice_history", story)

        self.assertEqual(story["choice_history"], [])
        self.assertEqual(len(story["chapters"]), 1)
        self.assertEqual(story["chapters"][0]["chapter_number"], 1)
        self.assertEqual(len(story["available_choices"]), 3)

        choice_ids = [choice["choice_id"] for choice in story["available_choices"]]
        self.assertEqual(len(choice_ids), len(set(choice_ids)))
        self.assertTrue(all(choice_id.startswith("ch1_") for choice_id in choice_ids))

        get_response = self.client.get(f"/stories/{story['story_id']}")

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json(), story)

    def test_invalid_writer_result_does_not_persist_story(self) -> None:
        payload = {
            "universe": "Harry Potter",
            "protagonist": "A student",
            "theme": "A castle mystery",
            "genre": "Fantasy",
            "tone": "Atmospheric",
        }

        with patch(
            "app.services.story_service.write_chapter_from_plan",
            return_value=ChapterWriterResult(
                chapter_title="Broken chapter",
                chapter_text="Text",
                choices=[
                    "Duplicate choice",
                    "Duplicate choice",
                    "Third choice",
                ],
                state_summary="Some state",
            ),
        ):
            response = self.client.post("/stories", json=payload)

        self.assertEqual(response.status_code, 502)
        self.assertEqual(self.repository._stories, {})

    def test_choose_story_branch_returns_updated_aggregate(self) -> None:
        story = self.create_story()
        selected_choice_id = story["available_choices"][0]["choice_id"]

        with patch(
            "app.services.story_continuation_service.plan_next_chapter",
            return_value=self.continuation_plan(),
        ), patch(
            "app.services.story_continuation_service.write_chapter_from_plan",
            return_value=self.continuation_writer(),
        ):
            response = self.client.post(
                f"/stories/{story['story_id']}/choose",
                json={"choice_id": selected_choice_id},
            )

        self.assertEqual(response.status_code, 200)

        updated_story = response.json()

        self.assertEqual(len(updated_story["chapters"]), 2)
        self.assertEqual(updated_story["chapters"][-1]["chapter_number"], 2)
        self.assertEqual(updated_story["current_state_summary"], self.continuation_writer().state_summary)
        self.assertEqual(len(updated_story["choice_history"]), 1)
        self.assertEqual(updated_story["choice_history"][0]["choice_id"], selected_choice_id)
        self.assertEqual(updated_story["choice_history"][0]["chapter_number"], 1)
        self.assertTrue(
            all(choice["choice_id"].startswith("ch2_") for choice in updated_story["available_choices"])
        )

    def test_choose_invalid_choice_returns_400(self) -> None:
        story = self.create_story()

        response = self.client.post(
            f"/stories/{story['story_id']}/choose",
            json={"choice_id": "invalid-choice-id"},
        )

        self.assertEqual(response.status_code, 400)
        self.assertEqual(response.json(), {"detail": "invalid choice"})

    def test_choose_same_choice_twice_returns_409(self) -> None:
        story = self.create_story()
        selected_choice_id = story["available_choices"][0]["choice_id"]

        with patch(
            "app.services.story_continuation_service.plan_next_chapter",
            return_value=self.continuation_plan(),
        ), patch(
            "app.services.story_continuation_service.write_chapter_from_plan",
            return_value=self.continuation_writer(),
        ):
            first_response = self.client.post(
                f"/stories/{story['story_id']}/choose",
                json={"choice_id": selected_choice_id},
            )

        self.assertEqual(first_response.status_code, 200)

        second_response = self.client.post(
            f"/stories/{story['story_id']}/choose",
            json={"choice_id": selected_choice_id},
        )

        self.assertEqual(second_response.status_code, 409)
        self.assertEqual(second_response.json(), {"detail": "choice already used"})

    def test_choose_not_found_story_returns_404(self) -> None:
        response = self.client.post(
            "/stories/story_missing/choose",
            json={"choice_id": "ch1_missing"},
        )

        self.assertEqual(response.status_code, 404)
        self.assertEqual(response.json(), {"detail": "story not found"})

    def test_invalid_choose_generation_does_not_persist_broken_aggregate(self) -> None:
        story = self.create_story()
        selected_choice_id = story["available_choices"][0]["choice_id"]

        with patch(
            "app.services.story_continuation_service.plan_next_chapter",
            return_value=self.continuation_plan(),
        ), patch(
            "app.services.story_continuation_service.write_chapter_from_plan",
            return_value=ChapterWriterResult(
                chapter_title="Broken continuation",
                chapter_text="Text",
                choices=["Duplicate", "Duplicate", "Third"],
                state_summary="Updated state",
            ),
        ):
            response = self.client.post(
                f"/stories/{story['story_id']}/choose",
                json={"choice_id": selected_choice_id},
            )

        self.assertEqual(response.status_code, 502)

        get_response = self.client.get(f"/stories/{story['story_id']}")

        self.assertEqual(get_response.status_code, 200)
        self.assertEqual(get_response.json(), story)


if __name__ == "__main__":
    unittest.main()

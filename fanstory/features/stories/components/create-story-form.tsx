import { createStoryAction } from "@/server/stories/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { InfoHint } from "@/components/shared/info-hint";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { getI18n } from "@/lib/i18n/server";

export async function CreateStoryForm() {
  const { locale, raw, t } = await getI18n();
  const storyLanguageLabels = raw<Record<string, string>>(
    "common.enums.storyLanguage",
  );

  return (
    <Card className="border-white/60 bg-white/85">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">
          {t("stories.create.formTitle")}
        </CardTitle>
        <CardDescription>{t("stories.create.formDescription")}</CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createStoryAction} className="grid gap-6">
          <div className="grid gap-2">
            <div className="flex items-center gap-2">
              <Label htmlFor="contentLanguage">
                {t("stories.create.fields.contentLanguage")}
              </Label>
              <InfoHint label={t("stories.create.tooltips.contentLanguage")} />
            </div>
            <select
              id="contentLanguage"
              name="contentLanguage"
              defaultValue={locale}
              className="flex h-11 w-full rounded-xl border border-slate-200 bg-white px-4 text-sm text-slate-950 transition outline-none focus:border-slate-400"
            >
              <option value="en">{storyLanguageLabels.en ?? "English"}</option>
              <option value="ru">{storyLanguageLabels.ru ?? "Russian"}</option>
            </select>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">{t("stories.create.fields.title")}</Label>
            <Input
              id="title"
              name="title"
              placeholder={t("stories.create.placeholders.title")}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="synopsis">
              {t("stories.create.fields.synopsis")}
            </Label>
            <Textarea
              id="synopsis"
              name="synopsis"
              placeholder={t("stories.create.placeholders.synopsis")}
              required
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="universe">
                {t("stories.create.fields.universe")}
              </Label>
              <Input
                id="universe"
                name="universe"
                placeholder={t("stories.create.placeholders.universe")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protagonist">
                {t("stories.create.fields.protagonist")}
              </Label>
              <Input
                id="protagonist"
                name="protagonist"
                placeholder={t("stories.create.placeholders.protagonist")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme">{t("stories.create.fields.theme")}</Label>
              <Input
                id="theme"
                name="theme"
                placeholder={t("stories.create.placeholders.theme")}
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">{t("stories.create.fields.genre")}</Label>
              <Input
                id="genre"
                name="genre"
                placeholder={t("stories.create.placeholders.genre")}
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="tone">{t("stories.create.fields.tone")}</Label>
              <Input
                id="tone"
                name="tone"
                placeholder={t("stories.create.placeholders.tone")}
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-slate-950 hover:bg-slate-800"
          >
            {t("common.actions.generateFirstChapter")}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

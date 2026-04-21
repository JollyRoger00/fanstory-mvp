import { createStoryAction } from "@/server/stories/actions";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function CreateStoryForm() {
  return (
    <Card className="border-white/60 bg-white/85">
      <CardHeader>
        <CardTitle className="font-heading text-3xl">
          Create a new interactive story
        </CardTitle>
        <CardDescription>
          This form writes into the story-generation service, not directly into
          UI state. The first chapter is generated immediately through the
          provider abstraction.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form action={createStoryAction} className="grid gap-6">
          <div className="grid gap-2">
            <Label htmlFor="title">Story title</Label>
            <Input
              id="title"
              name="title"
              placeholder="The House Behind the Signal"
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="synopsis">Synopsis</Label>
            <Textarea
              id="synopsis"
              name="synopsis"
              placeholder="A compact promise of the world, conflict and emotional direction."
              required
            />
          </div>
          <div className="grid gap-6 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="universe">Universe</Label>
              <Input
                id="universe"
                name="universe"
                placeholder="Neo-Victorian megacity"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="protagonist">Protagonist</Label>
              <Input
                id="protagonist"
                name="protagonist"
                placeholder="A disgraced archivist"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="theme">Theme</Label>
              <Input
                id="theme"
                name="theme"
                placeholder="Memory manipulation"
                required
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="genre">Genre</Label>
              <Input
                id="genre"
                name="genre"
                placeholder="Speculative mystery"
                required
              />
            </div>
            <div className="grid gap-2 md:col-span-2">
              <Label htmlFor="tone">Tone</Label>
              <Input
                id="tone"
                name="tone"
                placeholder="Tense, intimate, cinematic"
                required
              />
            </div>
          </div>
          <Button
            type="submit"
            className="w-full rounded-full bg-slate-950 hover:bg-slate-800"
          >
            Generate first chapter
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}

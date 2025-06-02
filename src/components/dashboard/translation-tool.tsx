"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, Wand2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useI18n } from "@/hooks/use-i18n";
import { useToast } from "@/hooks/use-toast";
import { suggestTranslation } from "@/ai/flows/suggest-translation";
import type { SuggestTranslationOutput } from "@/ai/flows/suggest-translation";

const formSchema = z.object({
  textToTranslate: z.string().min(1, "Text cannot be empty.").max(500, "Text is too long."),
});

export function TranslationTool() {
  const { t } = useI18n();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [translationResult, setTranslationResult] = useState<SuggestTranslationOutput | null>(null);
  const [originalText, setOriginalText] = useState<string>("");

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      textToTranslate: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setTranslationResult(null);
    setOriginalText(values.textToTranslate);
    try {
      const result = await suggestTranslation({ text: values.textToTranslate });
      setTranslationResult(result);
    } catch (error) {
      console.error("Translation error:", error);
      toast({
        variant: "destructive",
        title: "Error",
        description: t("translateTool.errorTranslating"),
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="font-headline text-2xl text-primary">{t("translateTool.title")}</CardTitle>
          <CardDescription>{t("translateTool.enterTextLabel")}</CardDescription>
        </CardHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <FormField
                control={form.control}
                name="textToTranslate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel htmlFor="textToTranslate" className="sr-only">
                      {t("translateTool.enterTextLabel")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        id="textToTranslate"
                        placeholder={t("translateTool.enterTextPlaceholder")}
                        className="min-h-[100px] resize-y"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </CardContent>
            <CardFooter>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto bg-accent hover:bg-accent/90 text-accent-foreground">
                {isLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <Wand2 className="mr-2 h-4 w-4" />
                )}
                {t("translateTool.submitButton")}
              </Button>
            </CardFooter>
          </form>
        </Form>
      </Card>

      {originalText && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{t("translateTool.originalText")}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-foreground/80">{originalText}</p>
          </CardContent>
        </Card>
      )}

      {translationResult && (
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline text-xl">{t("translateTool.suggestedTranslations")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h3 className="font-semibold text-primary">{t("translateTool.english")}</h3>
              <p className="text-foreground/80">{translationResult.english}</p>
              <p className="text-xs text-muted-foreground">{t("translateTool.qualityScore")}: N/A</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">{t("translateTool.marathi")}</h3>
              <p className="text-foreground/80">{translationResult.marathi}</p>
              <p className="text-xs text-muted-foreground">{t("translateTool.qualityScore")}: N/A</p>
            </div>
            <div>
              <h3 className="font-semibold text-primary">{t("translateTool.hindi")}</h3>
              <p className="text-foreground/80">{translationResult.hindi}</p>
              <p className="text-xs text-muted-foreground">{t("translateTool.qualityScore")}: N/A</p>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

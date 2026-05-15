
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Shield, Sparkles, User, Mail, Lock } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";

const signupSchema = z.object({
  username: z.string().min(3, "Username must be at least 3 characters").max(20, "Username is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  ageConfirmed: z.boolean().refine(v => v === true, "You must be 13 or older to join"),
});

export default function SignUpPage() {
  const signupImage = PlaceHolderImages.find(img => img.id === 'signup-bg');

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      ageConfirmed: false,
    },
  });

  function onSubmit(values: z.infer<typeof signupSchema>) {
    console.log(values);
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden">
        {signupImage && (
          <Image 
            src={signupImage.imageUrl} 
            alt={signupImage.description}
            fill
            className="object-cover"
            priority
            data-ai-hint={signupImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/40 to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4">
          <h2 className="font-headline text-4xl font-bold text-white leading-tight">
            Join the Sanctuary of <br /><span className="text-primary italic">Velvet Ink</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md italic">
            "We value your privacy like a sacred scroll. Share your stories, keep your secrets."
          </p>
          <div className="flex items-center gap-6 pt-8 text-muted-foreground/60">
            <div className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Privacy First</span>
            </div>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <span className="text-xs uppercase tracking-widest font-bold">Creative Freedom</span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="space-y-2 text-center lg:text-left">
            <Link href="/" className="inline-block font-headline text-2xl font-bold text-primary mb-4">Rosa Novara</Link>
            <h1 className="font-headline text-3xl font-bold">Forge Your Identity</h1>
            <p className="text-muted-foreground italic">Begin your journey in the Dark Archive</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-accent" />
                      Persona Name (Username)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="E.g. Raven_Writer" {...field} className="bg-muted/30 border-white/5 focus:border-primary/50" />
                    </FormControl>
                    <FormDescription className="text-[10px]">This is how you will be known to other travelers.</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Mail className="w-4 h-4 text-accent" />
                      Scroll Address (Email)
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="your@scroll.com" {...field} className="bg-muted/30 border-white/5 focus:border-primary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Lock className="w-4 h-4 text-accent" />
                      Secret Phrase (Password)
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-muted/30 border-white/5 focus:border-primary/50" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="ageConfirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 bg-muted/20 border-white/5">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Age Gate Affirmation
                      </FormLabel>
                      <FormDescription className="text-xs">
                        I confirm that I am at least 13 seasons of age.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 font-headline text-lg">
                Enter the Sanctuary
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground italic">
            Already a traveler?{" "}
            <Link href="/login" className="text-accent hover:underline font-semibold">Return to Login</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

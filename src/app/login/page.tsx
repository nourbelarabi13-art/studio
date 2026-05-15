
"use client";

import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Mail, Lock, Sparkles } from "lucide-react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  function onSubmit(values: z.infer<typeof loginSchema>) {
    console.log(values);
    // Logic for auth
  }

  return (
    <div className="min-h-screen flex items-center justify-center dark-fantasy-gradient p-8">
      <div className="w-full max-w-md glass-morphism rounded-3xl p-10 space-y-8 animate-fade-in shadow-2xl border-white/10">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-block font-headline text-3xl font-bold text-primary mb-4 drop-shadow-lg">Rosa Novara</Link>
          <h1 className="font-headline text-2xl font-bold text-white">Return to the Sanctuary</h1>
          <p className="text-muted-foreground italic">Your scrolls await your touch.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-accent" />
                    Email
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="your@scroll.com" {...field} className="bg-background/40 border-white/5 h-12 focus:border-primary/50" />
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
                  <div className="flex items-center justify-between">
                    <FormLabel className="flex items-center gap-2 text-muted-foreground">
                      <Lock className="w-4 h-4 text-accent" />
                      Password
                    </FormLabel>
                    <Link href="/forgot" className="text-xs text-accent hover:underline italic">Forgot your secret?</Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-background/40 border-white/5 h-12 focus:border-primary/50" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" className="w-full bg-primary hover:bg-primary/90 h-12 font-headline text-lg group">
              Manifest
              <Sparkles className="w-4 h-4 ml-2 group-hover:animate-pulse" />
            </Button>
          </form>
        </Form>

        <div className="text-center space-y-4">
          <p className="text-sm text-muted-foreground italic">
            New to the Archive?{" "}
            <Link href="/signup" className="text-accent hover:underline font-semibold">Forge your Identity</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

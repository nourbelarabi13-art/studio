
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
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
import { Mail, Lock, Sparkles, Loader2, Heart } from "lucide-react";
import { useAuth } from "@/firebase";
import { signInWithEmailAndPassword } from "firebase/auth";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export default function LoginPage() {
  const auth = useAuth();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  const form = useForm<z.infer<typeof loginSchema>>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof loginSchema>) {
    if (!auth) return;
    setIsLoading(true);

    try {
      await signInWithEmailAndPassword(auth, values.email, values.password);
      toast({
        title: "Welcome back, Dreamer",
        description: "Your sanctuary awaits your touch.",
      });
      router.push("/");
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Access Denied",
        description: "Your credentials don't seem to match our scrolls.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center dreamy-fantasy-gradient p-8">
      <div className="w-full max-w-md glass-morphism rounded-[2rem] p-10 space-y-8 animate-fade-in shadow-xl">
        <div className="text-center space-y-2">
          <Link href="/" className="inline-flex items-center gap-2 font-headline text-3xl font-bold text-primary mb-4">
            <Heart className="w-6 h-6 fill-primary" />
            Rosaline Bela
          </Link>
          <h1 className="font-headline text-2xl font-bold text-foreground">Enter the Sanctuary</h1>
          <p className="text-muted-foreground italic">Your stories are waiting for you.</p>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="w-4 h-4 text-primary/60" />
                    Email Address
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="dreamer@rosaline.com" {...field} className="bg-white/50 border-primary/10 h-12 focus:border-primary" />
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
                      <Lock className="w-4 h-4 text-primary/60" />
                      Secret Phrase
                    </FormLabel>
                    <Link href="/forgot" className="text-xs text-primary hover:underline italic">Forgot it?</Link>
                  </div>
                  <FormControl>
                    <Input type="password" placeholder="••••••••" {...field} className="bg-white/50 border-primary/10 h-12 focus:border-primary" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 h-12 rounded-full font-headline text-lg group transition-transform hover:scale-[1.02] active:scale-[0.98]">
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Return to Dreams
              {!isLoading && <Sparkles className="w-4 h-4 ml-2" />}
            </Button>
          </form>
        </Form>

        <div className="text-center">
          <p className="text-sm text-muted-foreground italic">
            New to the Sanctuary?{" "}
            <Link href="/signup" className="text-primary hover:underline font-semibold">Join our Archive</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

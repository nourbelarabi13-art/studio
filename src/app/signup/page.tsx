"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Sparkles, User, Mail, Lock, Loader2, Heart, PenTool, BookOpen } from "lucide-react";
import Image from "next/image";
import { PlaceHolderImages } from "@/lib/placeholder-images";
import { useAuth, useFirestore } from "@/firebase";
import { createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { doc, setDoc } from "firebase/firestore";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

const signupSchema = z.object({
  username: z.string().min(3, "Name must be at least 3 characters").max(20, "Name is too long"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Phrase must be at least 8 characters"),
  role: z.enum(["writer", "reader"]),
  ageConfirmed: z.boolean().refine(v => v === true, "You must be 13 or older to join"),
});

export default function SignUpPage() {
  const auth = useAuth();
  const db = useFirestore();
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const signupImage = PlaceHolderImages.find(img => img.id === 'signup-bg');

  const form = useForm<z.infer<typeof signupSchema>>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      username: "",
      email: "",
      password: "",
      role: "reader",
      ageConfirmed: false,
    },
  });

  async function onSubmit(values: z.infer<typeof signupSchema>) {
    if (!auth || !db) return;
    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, values.email, values.password);
      const user = userCredential.user;

      // Update auth profile with username for immediate display in UI
      await updateProfile(user, { displayName: values.username });

      // Create detailed Firestore profile scroll
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        username: values.username,
        email: values.email,
        role: values.role,
        ageConfirmed: values.ageConfirmed,
        createdAt: new Date().toISOString(),
        language: 'en',
        followerCount: 0,
        followingCount: 0,
        totalViews: 0,
        totalLikes: 0,
        publishedCount: 0,
        achievements: [],
        readingPreferences: {
          fontSize: 18,
          lineHeight: 1.8,
          mode: 'light'
        }
      });

      toast({
        title: "Welcome, Traveler",
        description: `Your space as a ${values.role} in the sanctuary is ready.`,
      });
      router.push("/");
    } catch (error: any) {
      // Interpret specific Firebase Auth errors for the user
      let errorMessage = "Something went wrong while setting up your sanctuary.";
      
      if (error.code === 'auth/email-already-in-use') {
        errorMessage = "This email address is already registered in our archive.";
      } else if (error.code === 'auth/weak-password') {
        errorMessage = "Your secret phrase is too weak. Please choose a stronger one.";
      } else if (error.code === 'auth/invalid-email') {
        errorMessage = "The email address provided is not recognized by the Archive.";
      }

      toast({
        variant: "destructive",
        title: "Ritual Interrupted",
        description: errorMessage,
      });
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen grid lg:grid-cols-2">
      <div className="hidden lg:block relative overflow-hidden bg-primary/5">
        {signupImage && (
          <Image 
            src={signupImage.imageUrl} 
            alt={signupImage.description}
            fill
            className="object-cover opacity-60"
            priority
            data-ai-hint={signupImage.imageHint}
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-transparent" />
        <div className="absolute inset-0 flex flex-col justify-end p-12 space-y-4">
          <h2 className="font-headline text-4xl font-bold text-foreground leading-tight">
            Join the Sanctuary of <br /><span className="text-primary italic">Soft Whispers</span>
          </h2>
          <p className="text-muted-foreground text-lg max-w-md italic">
            "Your stories are precious, and your peace is our priority. Welcome home."
          </p>
        </div>
      </div>

      <div className="flex items-center justify-center p-8 bg-background">
        <div className="w-full max-w-md space-y-8 animate-fade-in">
          <div className="space-y-2 text-center lg:text-left">
            <Link href="/" className="inline-flex items-center gap-2 font-headline text-2xl font-bold text-primary mb-4">
              <Heart className="w-5 h-5 fill-primary" />
              Rosaline Bela
            </Link>
            <h1 className="font-headline text-3xl font-bold">Join the Archive</h1>
            <p className="text-muted-foreground italic">Start your journey in our dreamy sanctuary</p>
          </div>

          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="username"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary/60" />
                      Pen Name
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="Your dreamer name" {...field} className="bg-white border-primary/10 h-11 focus:border-primary" />
                    </FormControl>
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
                      <Mail className="w-4 h-4 text-primary/60" />
                      Email Address
                    </FormLabel>
                    <FormControl>
                      <Input placeholder="your@dream.com" {...field} className="bg-white border-primary/10 h-11 focus:border-primary" />
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
                      <Lock className="w-4 h-4 text-primary/60" />
                      Secret Phrase
                    </FormLabel>
                    <FormControl>
                      <Input type="password" placeholder="••••••••" {...field} className="bg-white border-primary/10 h-11 focus:border-primary" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Choose Your Path</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col gap-3"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border p-4 bg-white hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                          <FormControl>
                            <RadioGroupItem value="reader" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-3 cursor-pointer w-full">
                            <div className="w-10 h-10 rounded-full bg-secondary flex items-center justify-center text-secondary-foreground">
                              <BookOpen className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">Reader</p>
                              <p className="text-xs text-muted-foreground">Explore and discover soft chronicles.</p>
                            </div>
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0 rounded-2xl border p-4 bg-white hover:bg-primary/5 transition-colors cursor-pointer border-primary/10">
                          <FormControl>
                            <RadioGroupItem value="writer" />
                          </FormControl>
                          <FormLabel className="font-normal flex items-center gap-3 cursor-pointer w-full">
                            <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                              <PenTool className="w-5 h-5" />
                            </div>
                            <div>
                              <p className="font-bold">Writer</p>
                              <p className="text-xs text-muted-foreground">Forge fragments and manifest stories.</p>
                            </div>
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="ageConfirmed"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-2xl border p-4 bg-primary/5 border-primary/10">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel className="text-sm font-semibold">
                        I am 13 or older
                      </FormLabel>
                      <FormDescription className="text-xs">
                        By checking this, you confirm you're of age to join our space.
                      </FormDescription>
                    </div>
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90 h-12 rounded-full font-headline text-lg">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Begin Your Story
                {!isLoading && <Sparkles className="w-4 h-4 ml-2" />}
              </Button>
            </form>
          </Form>

          <p className="text-center text-sm text-muted-foreground italic">
            Already a dreamer?{" "}
            <Link href="/login" className="text-primary hover:underline font-semibold">Return to Sanctuary</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

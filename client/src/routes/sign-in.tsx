import { createFileRoute } from '@tanstack/react-router'
import { SignIn } from "@clerk/clerk-react";

export const Route = createFileRoute('/sign-in')({
  component: () => (
    <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
      <SignIn routing="path" path="/sign-in" signUpUrl="/sign-up" forceRedirectUrl="/app" />
    </div>
  )
})

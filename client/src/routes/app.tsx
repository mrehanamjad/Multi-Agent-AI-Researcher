import { createFileRoute, Outlet } from '@tanstack/react-router'
import { AppLayout } from "@/components/layout/AppLayout";
import { SignedIn, SignedOut, RedirectToSignIn } from "@clerk/clerk-react";

export const Route = createFileRoute('/app')({
  component: AppRouteLayout,
})

function AppRouteLayout() {
  return (
    <>
      <SignedIn>
        <AppLayout>
          <Outlet />
        </AppLayout>
      </SignedIn>
      <SignedOut>
        <RedirectToSignIn />
      </SignedOut>
    </>
  )
}

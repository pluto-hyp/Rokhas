import { GalleryVerticalEnd } from "lucide-react"
import { ImageSlideshow } from "@/components/image-slide-show"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

import { SignupForm } from "@/components/signup-form"

export default function SignupPage() {
  return (
    <div className="grid min-h-svh lg:grid-cols-2">
      <div className="flex flex-col gap-4 p-6 md:p-10">
        <div className="flex justify-center gap-2 md:justify-start">
          <a href="/" className="flex items-center gap-2 font-medium">
            <div className="flex size-6 items-center justify-center">
              <Avatar className="size-8 cursor-pointer">
                <AvatarImage src={"/rokhas.svg"} />
                <AvatarFallback>Rokhas.</AvatarFallback>
              </Avatar>
            </div>
            Rokhas.
          </a>
        </div>
        <div className="flex flex-1 items-center justify-center">
          <div className="w-full max-w-xs">
            <SignupForm />
          </div>
        </div>
      </div>
      <div className="relative hidden bg-muted lg:block overflow-hidden">
        <ImageSlideshow />
      </div>
    </div>
  )
}

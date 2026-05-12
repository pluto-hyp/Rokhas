"use client"

import * as React from "react"
import {
  BellIcon,
  CheckIcon,
  LanguagesIcon,
  SearchIcon,
} from "lucide-react"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"

const languages = [
  { code: "en", label: "English" },
  { code: "fr", label: "French" },
  { code: "ar", label: "Arabic" },
]

export function SiteHeader() {
  const [language, setLanguage] = React.useState("en")
  const selectedLanguage = languages.find((item) => item.code === language)

  return (
    <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
      <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <h1 className="text-base font-medium">Documents</h1>
        <div className="ml-auto flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Search"
                >
                  <SearchIcon />
                  <span className="sr-only">Search dashboard</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 rounded-xl p-2">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Search</DropdownMenuLabel>
                <div className="px-1.5 pb-1">
                  <Input placeholder="Search dashboard..." type="search" />
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Notifications"
                >
                  <BellIcon />
                  <span className="sr-only">Open notifications</span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="w-72 rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="px-2 py-3 text-sm text-muted-foreground">
                  No new notifications.
                </div>
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>

          <ModeToggle />

          <DropdownMenu>
            <DropdownMenuTrigger
              render={
                <Button
                  variant="ghost"
                  size="icon"
                  className="rounded-full"
                  title="Language"
                >
                  <LanguagesIcon />
                  <span className="sr-only">
                    Switch language. Current language is{" "}
                    {selectedLanguage?.label ?? "English"}
                  </span>
                </Button>
              }
            />
            <DropdownMenuContent align="end" className="rounded-xl">
              <DropdownMenuGroup>
                <DropdownMenuLabel>Language</DropdownMenuLabel>
                <DropdownMenuSeparator />
                {languages.map((item) => (
                  <DropdownMenuItem
                    key={item.code}
                    className="rounded-lg"
                    onClick={() => setLanguage(item.code)}
                  >
                    {item.label}
                    {language === item.code ? (
                      <CheckIcon className="ml-auto" />
                    ) : null}
                  </DropdownMenuItem>
                ))}
              </DropdownMenuGroup>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}

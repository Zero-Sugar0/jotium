//components/custom/history.tsx
"use client";

import * as VisuallyHidden from "@radix-ui/react-visually-hidden";
import cx from "classnames";
import { AlarmClockIcon, Forward } from "lucide-react";
import Link from "next/link";
import { useParams, usePathname } from "next/navigation";
import { User } from "next-auth";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import useSWR from "swr";

import { ChatMeta } from "@/lib/redis-queries";
import { fetcher, generateUUID } from "@/lib/utils";

import {
  InfoIcon,
  MenuIcon,
  MoreHorizontalIcon,
  PencilEditIcon,
  TrashIcon,
} from "./icons";
import { NavUser } from "./nav-user";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";
import { Input } from "../ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "../ui/sheet";

export const History = ({ user }: { user: User | undefined }) => {
  const { id } = useParams();
  const pathname = usePathname();

  const [isHistoryVisible, setIsHistoryVisible] = useState(false);
  const {
    data: history,
    isLoading,
    mutate,
  } = useSWR<Array<ChatMeta>>(user ? "/api/history" : null, fetcher, {
    fallbackData: [],
  });

  // Add state for profile info
  const [profile, setProfile] = useState<{ firstName?: string; lastName?: string; plan?: string }>({});

  useEffect(() => {
    // Only mutate when the history component is visible to prevent unnecessary updates
    if (isHistoryVisible) {
      mutate();
    }
  }, [pathname, mutate, isHistoryVisible]);

  // Fetch profile info for sidebar user display
  useEffect(() => {
    if (user) {
      fetch("/account/api/profile")
        .then((res) => res.ok ? res.json() : null)
        .then((data) => {
          if (data) setProfile({ firstName: data.firstName, lastName: data.lastName, plan: data.plan });
        });
    }
  }, [user]);

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const filteredHistory = history?.filter((chat) =>
    chat.title?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async () => {
    const deletePromise = fetch(`/api/chat?id=${deleteId}`, {
      method: "DELETE",
    });

    toast.promise(deletePromise, {
      loading: "Deleting chat...",
      success: () => {
        mutate((history) => {
          if (history) {
            return history.filter((h) => h.id !== id);
          }
        });
        return "Chat deleted successfully";
      },
      error: "Failed to delete chat",
    });

    setShowDeleteDialog(false);
  };

  function getTitleFromChat(chat: ChatMeta): import("react").ReactNode {
    // Use the title from Redis, or fallback to a default
    if (chat.title && chat.title !== 'Untitled chat') {
      const content = chat.title.trim();
      return content.length > 40 ? content.slice(0, 40) + "..." : content;
    }
    return <span className="italic text-zinc-400">Untitled chat</span>;
  }

  return (
    <>
      <Button
        variant="outline"
        className="p-1.5 h-fit"
        onClick={() => {
          setIsHistoryVisible(true);
        }}
      >
        <MenuIcon />
      </Button>

      <Sheet
        open={isHistoryVisible}
        onOpenChange={(state) => {
          setIsHistoryVisible(state);
        }}
      >
        <SheetContent side="left" className="p-3 w-[68vw] sm:w-72 max-w-[90vw] bg-background/80 backdrop-blur-md border-r border-border/50 flex flex-col h-full">
          <SheetHeader className="pb-2">
            <VisuallyHidden.Root>
              <SheetTitle className="text-left">History</SheetTitle>
              <SheetDescription className="text-left">
                {history === undefined ? "loading" : history.length} chats
              </SheetDescription>
            </VisuallyHidden.Root>
          <div className="text-sm flex flex-row items-center">
            <div className="flex flex-row gap-2">
              <div className="dark:text-zinc-300 font-bold">History</div>
              <div className="dark:text-zinc-400 text-zinc-500">
                {history?.length ?? ""}
              </div>
            </div>
          </div>
          </SheetHeader>

          <div className="mt-4 flex flex-col flex-1 overflow-hidden">
            <div className="px-1">
              {user && (
                <>
                  <Button
                    className="font-normal text-sm flex flex-row justify-between text-white w-full mb-2"
                    asChild
                    onClick={() => setIsHistoryVisible(false)} // Close sidebar on new chat click
                  >
                    <Link href={`/chat/${generateUUID()}`} prefetch={false}>
                      <div>Start a new chat</div>
                      <PencilEditIcon size={14} />
                    </Link>
                  </Button>
                  <Button
                    className="font-normal text-base flex flex-row justify-between text-foreground w-full mb-2"
                    variant="ghost"
                    asChild
                    onClick={() => setIsHistoryVisible(false)} // Close sidebar on tasks click
                  >
                    <Link href="/task" prefetch={false}>
                      <div className="text-base">Tasks</div>
                      <AlarmClockIcon size={16} className="text-foreground" />
                    </Link>
                  </Button>
                  <div className="relative mb-2">
                    <Input
                      type="search"
                      placeholder="Search history..."
                      className="h-9 pr-10"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      autoFocus={false}
                      tabIndex={-1}
                    />
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="11" cy="11" r="8"></circle>
                        <path d="m21 21-4.35-4.35"></path>
                      </svg>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="flex flex-col overflow-y-auto p-1 flex-1 tiny-scrollbar mt-2">
              {!user ? (
                <div className="text-zinc-500 size-full flex flex-row justify-center items-center text-sm gap-2 text-center">
                  <InfoIcon />
                  <div>Login to save and revisit previous chats!</div>
                </div>
              ) : null}

              {!isLoading && history?.length === 0 && user ? (
                <div className="text-zinc-500 size-full flex flex-row justify-center items-center text-sm gap-2 text-center">
                  <InfoIcon />
                  <div>No chats found</div>
                </div>
              ) : null}

              {isLoading && user ? (
                <div className="flex flex-col">
                  {[44, 32, 28, 52].map((item) => (
                    <div key={item} className="p-2 my-[2px]">
                      <div
                        className={`w-${item} h-[20px] rounded-md bg-zinc-200 dark:bg-zinc-600 animate-pulse`}
                      />
                    </div>
                  ))}
                </div>
              ) : null}

              {filteredHistory &&
                filteredHistory.map((chat) => (
                  <div
                    key={chat.id}
                    className={cx(
                      "flex flex-row items-center gap-6 hover:bg-zinc-200 dark:hover:bg-zinc-700 rounded-md pr-2",
                      { "bg-zinc-200 dark:bg-zinc-700": chat.id === id },
                    )}
                  >
                    <Button
                      variant="ghost"
                      className={cx(
                        "hover:bg-zinc-200 dark:hover:bg-zinc-700 justify-between p-0 text-sm font-normal flex flex-row items-center gap-2 pr-2 w-full transition-none",
                      )}
                      asChild
                      onClick={() => setIsHistoryVisible(false)} // Close sidebar on chat link click
                    >
                      <Link
                        href={`/chat/${chat.id}`}
                        className="text-ellipsis overflow-hidden text-left py-2 pl-2 rounded-lg outline-zinc-900"
                      >
                        {getTitleFromChat(chat)}
                      </Link>
                    </Button>

                    <DropdownMenu modal={true}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          className="p-0 h-fit font-normal text-zinc-500 transition-none hover:bg-zinc-200 dark:hover:bg-zinc-700"
                          variant="ghost"
                        >
                          <MoreHorizontalIcon />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent side="left" className="z-[60]">
                        <DropdownMenuItem asChild>
                          <Button
                            className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm"
                            variant="ghost"
                            onClick={() => {
                              // Share functionality
                              const shareUrl = `${window.location.origin}/chat/${chat.id}`;
                              if (navigator.share) {
                                // Use Web Share API if available
                                navigator.share({
                                  title: chat.title || 'Chat',
                                  url: shareUrl,
                                }).catch(() => {
                                  // Fallback to clipboard if share fails
                                  navigator.clipboard.writeText(shareUrl);
                                  toast.success("Chat link copied to clipboard!");
                                });
                              } else {
                                // Fallback to clipboard
                                navigator.clipboard.writeText(shareUrl);
                                toast.success("Chat link copied to clipboard!");
                              }
                              setIsHistoryVisible(false); // Close sidebar on share
                            }}
                          >
                            <Forward size={16} />
                            <div>Share</div>
                          </Button>
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Button
                            className="flex flex-row gap-2 items-center justify-start w-full h-fit font-normal p-1.5 rounded-sm"
                            variant="ghost"
                            onClick={() => {
                              setDeleteId(chat.id);
                              setShowDeleteDialog(true);
                              setIsHistoryVisible(false); // Close sidebar on delete button click
                            }}
                          >
                            <TrashIcon />
                            <div>Delete</div>
                          </Button>
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                ))}
            </div>
          </div>

          {/* NavUser at the bottom of the sidebar */}
          <div className="pt-1 mb-2">
            {user && (
              <NavUser
                user={{
                  firstName: profile.firstName,
                  lastName: profile.lastName,
                  plan: profile.plan,
                  email: user.email || "",
                  avatar: user.image || "", // always string
                  name: user.name || "", // always string
                }}
                onCloseSidebar={() => setIsHistoryVisible(false)} // Pass close handler to NavUser
              />
            )}
            <div className="mt-1 text-center text-[10px] text-muted-foreground">jotium v0.1.9</div>
          </div>
        </SheetContent>
      </Sheet>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete your
              chat and remove it from our servers.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete}>
              Continue
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
};

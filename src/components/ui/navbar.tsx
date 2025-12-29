import { Button } from "@/components/ui/button";
import { ModeToggle } from "@/components/theme/mode-toggle";

export const NavbarDemo = () => {
  return (
    <nav className="flex w-full items-center justify-between border-t border-b border-neutral-200 px-4 py-4 dark:border-neutral-800">
      <div className="flex items-center gap-2">
        <div className="size-7 rounded-full bg-gradient-to-br from-violet-500 to-pink-500" />
        <h1 className="text-base font-bold md:text-2xl">Aceternity UI</h1>
      </div>
      <div className="flex items-center gap-4">
        <ModeToggle />
        <Button className="w-24 transform rounded-lg bg-black px-6 py-2 font-medium text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-gray-800 md:w-32 dark:bg-white dark:text-black dark:hover:bg-gray-200">
          Login
        </Button>
      </div>
    </nav>
  );
};

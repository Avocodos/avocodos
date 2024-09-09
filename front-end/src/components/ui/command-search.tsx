import {
  Command,
  CommandInput,
  CommandList,
  CommandItem
} from "@/components/ui/command";
import React from "react";

interface ICommandProps {
  commands: { value: string; label: string }[];
  placeholder?: string;
}

export default function CommandSearch({
  commands,
  placeholder
}: ICommandProps) {
  const [open, setOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState("");

  const handleValueChange = (value: string) => {
    setInputValue(value);
    setOpen(!!value);
  };

  const filteredCommands = Array.isArray(commands)
    ? commands.filter((command) =>
        command.label.toLowerCase().includes(inputValue.toLowerCase())
      )
    : [];
  console.log("filteredCommands", filteredCommands);
  return (
    <Command className="relative rounded-lg border shadow-md">
      <CommandInput
        placeholder={placeholder ?? "Type a command or search..."}
        onValueChange={handleValueChange}
      />
      {
        <CommandList className="static top-11 z-50 max-h-[300px] w-full avocodos-transition">
          {open &&
            filteredCommands.length > 0 &&
            filteredCommands.map((command) => (
              <CommandItem key={command.value} value={command.value}>
                {command.label}
              </CommandItem>
            ))}
        </CommandList>
      }
    </Command>
  );
}

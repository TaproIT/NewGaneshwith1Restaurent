import React from "react";
import { Check, Palette as PaletteIcon } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useTheme } from "@/context/ThemeContext";
import { PALETTES } from "@/lib/theme-palettes";

const ThemeSwitcher: React.FC = () => {
  const { palette, setPalette } = useTheme();

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          aria-label="Change theme"
          title="Theme"
          className="text-gray cursor-pointer hover:text-primary"
        >
          <PaletteIcon size={24} />
        </button>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-64 p-3 rounded-2xl bg-mainWhite">
        <p className="px-2 pb-2 text-sm font-medium text-gray">Theme</p>
        <div className="flex flex-col gap-1" role="radiogroup" aria-label="Theme">
          {PALETTES.map((p) => {
            const active = p.id === palette;
            return (
              <button
                key={p.id}
                type="button"
                role="radio"
                aria-checked={active}
                onClick={() => setPalette(p.id)}
                className={`flex items-center gap-3 p-2 rounded-lg text-sm text-gray cursor-pointer border-2 ${
                  active ? "border-primary bg-bg" : "border-transparent hover:bg-bg"
                }`}
              >
                <span
                  aria-hidden="true"
                  className="w-7 h-7 rounded-full shrink-0 border border-black/10"
                  style={{
                    background: `linear-gradient(135deg, ${p.primary} 0 50%, ${p.secondary} 50% 100%)`,
                  }}
                />
                <span className="flex-1 text-left">{p.name}</span>
                {active && <Check size={18} className="text-primary" />}
              </button>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default ThemeSwitcher;

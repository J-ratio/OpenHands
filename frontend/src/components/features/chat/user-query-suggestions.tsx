import React from "react";
import { TbMessage2Question } from "react-icons/tb";
import { cn } from "#/utils/utils";

export interface UserSuggestion {
  question: string;
  isStatic?: boolean | undefined;
  modelOneResponse?: string | undefined;
  modelTwoResponse?: string | undefined;
}

const initialCodeSnippet = `\n\`\`\`c
#include <stdint.h>
#include <stddef.h>

static int32_t adc_read_channel(struct adc * const a, int32_t ch, uint16_t * const val)
{
    if (a == NULL)
    {
        return -1;
    }

    if (val == NULL)
    {
        return -1;
    }

    if (a->ops.start(ch) < 0)
    {
        return -1;
    }

    a->ops.delay_ms(1U);

    if (a->ops.read(ch, val) < 0)
    {
        return -1;
    }

    return 0;
    }
\`\`\`
Only provide C code and nothing else.`;

const suggestions: Array<UserSuggestion> = [
  {
    question: "Fix MISRA coding guidelines violations in the following code.",
    isStatic: true,
    modelOneResponse: `
\`\`\`c
#include <stdint.h>
#include <stddef.h>


static int adc_read_channel(struct adc * const a, int ch, uint16_t * const val) {
    if (a == NULL || val == NULL) {
        return -1;
    }

    if (a->ops.start(ch) < 0) {
        return -1;
    }

    a->ops.delay_ms((unsigned int)1);

    if (a->ops.read(ch, val) < 0) {
        return -1;
    }

    return 0;
}
\`\`\`
`,

    modelTwoResponse: `
\`\`\`c
#include <stdint.h>
#include <stddef.h>

/* Forward declaration of the ADC device structure. */
struct adc;

/* Forward declaration of the operations structure, used by the ADC device. */
struct adc_ops;

/* Externally declared ADC operations structure, assumed to be defined elsewhere. */
extern struct adc_ops ops;

/* ADC device structure expected to contain an operations pointer. */
struct adc {
    struct adc_ops *ops;
};

/* Operations functions, assumed to be defined elsewhere. */
struct adc_ops {
    int (*start)(int);
    void (*delay_ms)(unsigned int);
    int (*read)(int, uint16_t *);
};

/*
 * Read a single ADC channel value.
 *
 * @param a  Pointer to the ADC device (cannot be NULL).
 * @param ch ADC channel number (non-negative value assumed).
 * @param val Pointer to a uint16_t variable where the result is stored (cannot be NULL).
 * @return 0 on success, -1 on error.
 */
static int adc_read_channel(struct adc * const a, int ch, uint16_t * const val)
{
    /* Check for NULL pointers. */
    if ((a == NULL) || (val == NULL)) {
        return -1;
    }

    /* Validate channel number range: ADC channels are assumed to be >= 0. */
    if (ch < 0) {
        return -1;
    }

    /* Start conversion. */
    if ((a->ops->start)(ch) < 0) {
        return -1;
    }

    /* Delay for at least 1 ms. */
    (a->ops->delay_ms)((unsigned int)1U);

    /* Read conversion result. */
    if ((a->ops->read)(ch, val) < 0) {
        return -1;
    }

    return 0;
}
\`\`\``,
  },
  {
    question: "Explain this register map in simple terms.",
  },
  { question: "Suggest test cases for this communication protocol." },
  { question: "Find integration issues in this system design document." },
  { question: "Translate this hardware spec into configuration code." },
];

interface UserQuerySuggestionsProps {
  onSelect: (suggestion: UserSuggestion) => void;
}

export function UserQuerySuggestions({ onSelect }: UserQuerySuggestionsProps) {
  const [open, setOpen] = React.useState(false);
  const ref = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }

    if (open) {
      document.addEventListener("mousedown", handleClickOutside);
    } else {
      document.removeEventListener("mousedown", handleClickOutside);
    }

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="p-2 hover:bg-neutral-700 rounded-md transition-colors"
        type="button"
      >
        <TbMessage2Question size={20} />
      </button>

      {open && (
        <div
          className={cn(
            "absolute bottom-full right-0 mb-2 min-w-100 max-w-md",
            "bg-neutral-800 border border-neutral-600 rounded-md shadow-lg z-50",
          )}
        >
          <div className="text-neutral-200 px-3 py-2 bg-neutral-700 font-semibold">
            Suggested questions
          </div>
          <ul className="max-h-60 overflow-y-auto">
            {suggestions.map((suggestion, idx) => (
              <li
                key={idx}
                onClick={() => {
                  onSelect(
                    idx === 0
                      ? {
                          ...suggestion,
                          question: `${suggestion.question} ${initialCodeSnippet}`,
                        }
                      : suggestion,
                  );
                  setOpen(false);
                }}
                className="px-3 py-2 cursor-pointer text-neutral-200 hover:bg-neutral-600 hover:text-white"
              >
                {suggestion.question}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

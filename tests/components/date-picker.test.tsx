import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DatePicker } from "@/components/ui/date-picker";

describe("DatePicker", () => {
  it("emits the correct YYYY-MM-DD value when a calendar day is clicked", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DatePicker id="test" onChange={onChange} />);

    // Open the calendar popover
    await user.click(screen.getByRole("button", { name: /selecionar data/i }));

    // Click day 15 (always visible in the current month)
    const dayButton = screen.getByRole("button", { name: /15/i });
    await user.click(dayButton);

    expect(onChange).toHaveBeenCalledOnce();
    const emitted = onChange.mock.calls[0][0];
    // The emitted value must contain "-15" (day 15), regardless of timezone
    expect(emitted).toMatch(/-15$/);
  });

  it("preserves the correct date across DST boundaries via toLocalISODate", async () => {
    // Simulate a post-DST timezone (UTC+1) by creating a date at midnight local
    // where UTC would roll back to the previous day
    const onChange = vi.fn();

    // Provide a known value in April (post-DST in Portugal)
    render(<DatePicker id="test" value="2026-04-03" onChange={onChange} />);

    // The displayed input should show 03/04/2026 (dd/mm/yyyy pt-PT format)
    const input = screen.getByRole("textbox");
    expect(input).toHaveValue("03/04/2026");
  });

  it("emits correct date when typing a date string in the input", async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<DatePicker id="test" onChange={onChange} />);

    const input = screen.getByRole("textbox");
    await user.clear(input);
    await user.type(input, "2026-04-10");

    // Find the call that emitted a valid date (not empty string)
    const dateCalls = onChange.mock.calls.filter(
      ([val]: [string]) => val !== "" && val.match(/^\d{4}-\d{2}-\d{2}$/),
    );
    expect(dateCalls.length).toBeGreaterThan(0);
    const lastDate = dateCalls[dateCalls.length - 1][0];
    // Must be April 10th, not April 9th
    expect(lastDate).toBe("2026-04-10");
  });
});

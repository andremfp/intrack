import { render, screen } from "@testing-library/react";

/**
 * Smoke test — confirms jsdom + @testing-library/react + jest-dom are wired
 * correctly. Not tied to any real component.
 */
it("renders an element and finds it in the document", () => {
  render(<p>hello</p>);
  expect(screen.getByText("hello")).toBeInTheDocument();
});

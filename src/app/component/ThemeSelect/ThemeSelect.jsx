"use client"

export const ThemeSelect = () => {
  return (
    <>
      <select
        className="select select-bordered fixed w-[150px] outline-none bottom-[20px] left-[20px] ring-0 focus:ring-0 focus:outline-none"
        onChange={(e) => {
          const theme = e.target.value;
          document.documentElement.setAttribute("data-theme", theme);
          localStorage.setItem("theme", theme);
        }}
      >
        <option value="cupcake">Cupcake</option>
        <option value="light">Light</option>
        <option value="retro">Retro</option>
        <option value="abyss">Abyss</option>
        <option value="aqua">Aqua</option>
      </select>
    </>
  );
}
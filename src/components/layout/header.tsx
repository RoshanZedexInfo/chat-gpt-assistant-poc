export default function Header() {
  return (
    <header className="w-full h-[10vh] flex items-center justify-center">
      <div className="w-full h-full flex px-5">
        <a className="my-auto mx-2" href="/">Home</a>
        <a className="my-auto mx-2" href="/assistant">Assistant</a>
      </div>
    </header>
  );
}
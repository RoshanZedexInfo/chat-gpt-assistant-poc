import Footer from "./footer";
import Header from "./header";

export default function Layout({
    children,
  }: Readonly<{
    children: React.ReactNode;
  }>) {
  return (
    <div className="w-full h-full p-3">
        <Header/>
            {children}
        <Footer/>
    </div>
  );
}
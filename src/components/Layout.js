import Navbar from "./Navbar";

function Layout({ children }) {
  return (
    <div className="fh-app">
      <Navbar />
      <main className="fh-main">{children}</main>
      {/* optional footer later */}
    </div>
  );
}

export default Layout;

import LogoNavbar from "./logo_navbar";

export default function Navbar() {
    return (
        <header className="navbar navbar-expand-md navbar-light d-print-none">
            <div className="container-xl">
                <LogoNavbar/>
                <div className="navbar-nav flex-row order-md-last">
                    <div className="nav-item dropdown">
                        {/* eslint-disable-next-line jsx-a11y/anchor-is-valid */}
                        <a href="#" className="nav-link d-flex lh-1 text-reset p-0" data-bs-toggle="dropdown"
                        aria-label="Open user menu" aria-expanded="false">
                            <span className="avatar avatar-rounded">GI</span>
                            <div className="d-none d-xl-block ps-2">
                                <div>UserName</div>
                            </div>
                        </a>
                        {/* @livewire('auth.logout') */}
                    </div>
                </div>
            </div>
        </header>
    );
}
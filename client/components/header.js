import Link from "next/link";

const Header = ({ currentUser }) => {
    const links = [
        // if no currentUser -> sign up
        !currentUser && { label: "Sign Up", href: "/auth/signup" },
        !currentUser && { label: "Sign In", href: "/auth/signin" },
        currentUser && { label: "Sell Tickets", href: "/tickets/new" },
        currentUser && { label: "My Orders", href: "/orders" },
        currentUser && { label: "Sign Out", href: "/auth/signout" },
    ]
        // Filter out falsy values (null or undefined)
        .filter((linkConfig) => linkConfig)
        // Map each link configuration to a li element with a Link component
        .map(({ label, href }) => {
            return (
                <li key={href} className="nav-item">
                    <Link href={href}>{label}</Link>
                </li>
            );
        });

    // Render the navigation bar using Bootstrap classes
    return (
        <nav className="navbar navbar-light bg-light">
            <Link className="navbar-brand" href="/">
                TicketTix
            </Link>

            <div className="d-flex justify-content-end">
                <ul className="nav d-flex align-items-center">{links}</ul>
            </div>
        </nav>
    );
};
export default Header;

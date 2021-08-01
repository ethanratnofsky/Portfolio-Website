import "./Hamburger.css";

function Hamburger({ onClick, isActive }) {
    function handleClick() {
        onClick();
    };

    return (
        <div onClick={handleClick} className={"hamburger" + (isActive ? " active" : "")} >
            <div className="top" />
            <div className="middle" />
            <div className="bottom" />
        </div>
    );
}

export default Hamburger;
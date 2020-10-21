import React, { useRef, useEffect } from "react";
// https://stackoverflow.com/questions/32553158/detect-click-outside-react-component
/**
 * Hook that alerts clicks outside of the passed ref
 */
function useOutsideAlerter(ref, setOpenDict, openDict, openName) {
    useEffect(() => {
        /**
         * Alert if clicked on outside of element
         */
        function handleClickOutside(event) {
            if (ref.current && !ref.current.contains(event.target)) {
                // alert("You clicked outside of me!");
                // close the dropdown 
                setOpenDict({ ...openDict, [openName]: false});
            }
        }

        // Bind the event listener
        document.addEventListener("mousedown", handleClickOutside);
        // this is the cleanup function i.e. componentWillUnmount
        // unmounting meaning that React is no longer rendering this element
        // (i.e. when the dropdown is closed)
        return () => {
            // Unbind the event listener on clean up
            document.removeEventListener("mousedown", handleClickOutside);
        };
    }, [ref]);
}

/**
 * Component that alerts if you click outside of it
 */
export default function OutsideAlerter(props) {
    const wrapperRef = useRef(null);
    useOutsideAlerter(wrapperRef, props.setOpenDict, props.openDict, props.openName);

    return <div ref={wrapperRef}>{props.children}</div>;
}
import React, { forwardRef, useMemo } from "react";
import { motion, HTMLMotionProps } from "framer-motion";
import { inTheCenter, onTheLeft, onTheRight } from "@/config";

type PageTransitionProps = HTMLMotionProps<"div">;
type PageTransitionRef = React.ForwardedRef<HTMLDivElement>;

function PageTransition(
  { children, ...rest }: PageTransitionProps,
  ref: PageTransitionRef
) {
  const transition = { duration: 0.6, ease: "easeInOut" };

  return (
    <motion.div
      ref={ref}
      initial={rest.initial ? rest.initial : onTheRight}
      animate={inTheCenter}
      exit={rest.exit ? rest.exit : onTheLeft}
      transition={transition}
      {...rest}
    >
      {children}
    </motion.div>
  );
}

export default forwardRef(PageTransition);

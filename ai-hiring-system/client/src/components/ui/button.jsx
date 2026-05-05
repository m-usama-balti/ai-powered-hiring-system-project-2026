import React from 'react';

const buttonVariants = {
    default: 'bg-blue-900 text-white hover:bg-blue-800',
    ghost: 'bg-transparent text-slate-700 hover:bg-blue-50 hover:text-blue-900',
};

const buttonSizes = {
    default: 'h-10 px-4 py-2',
    sm: 'h-9 px-3',
    icon: 'h-10 w-10 p-0',
};

const Button = React.forwardRef(({ className = '', variant = 'default', size = 'default', asChild = false, children, ...props }, ref) => {
    const classes = [
        'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
        buttonVariants[variant] || buttonVariants.default,
        buttonSizes[size] || buttonSizes.default,
        className,
    ]
        .filter(Boolean)
        .join(' ');

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            ...props,
            ref,
            className: [children.props.className, classes].filter(Boolean).join(' '),
        });
    }

    return (
        <button ref={ref} className={classes} {...props}>
            {children}
        </button>
    );
});

Button.displayName = 'Button';

export { Button };
export default Button;

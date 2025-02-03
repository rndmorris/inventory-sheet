const styles = (...baseClasses: string[]) => (...additionalClasses: string[]) => [...baseClasses, ...additionalClasses].join(" ");

export const buttonPrimary = styles("bg-(--color-primary) hover:bg-(--color-primary-hover) text-white font-bold py-2 px-4 rounded");
export const buttonPrimaryPressed = styles("bg-(--color-primary-hover) text-white font-bold py-2 px-4 rounded");
export const buttonSecondary = styles("bg-(--color-secondary) hover:bg-(--color-secondary-hover) text-white font-semibold py-2 px-4 rounded");
export const buttonSecondarySmall = styles("bg-(--color-secondary) hover:bg-(--color-secondary-hover) text-white font-semibold rounded w-7 h-7");

export const navLink = styles(buttonPrimary(), "[&.active]:bg-(--color-primary-hover)");
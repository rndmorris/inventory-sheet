const styles = (...baseClasses: string[]) => (...additionalClasses: string[]) => [...baseClasses, ...additionalClasses].join(" ");

const button = styles("text-white font-bold rounded");
const primary = "bg-(--color-primary) hover:bg-(--color-primary-hover)";
const secondary = "bg-(--color-secondary) hover:bg-(--color-secondary-hover)";
const tertiary = "bg-(--color-tertiary) hover:bg-(--color-tertiary-hover)"

export const buttonPrimary = styles(button(), primary, "py-2 px-4");
export const buttonPrimaryPressed = styles(buttonPrimary(), "bg-(--color-primary-hover)");
export const buttonPrimarySmall = styles(button(), primary, "font-semibold px-2");

export const buttonSecondary = styles(button(), secondary, "py-2 px-4");
export const buttonSecondarySmall = styles(button(), secondary, "font-semibold px-2")

export const buttonTertiary = styles(button(), tertiary, "py-2 px-4");
export const buttonTertiarySmall = styles(button(), tertiary, "font-semibold px-2")

export const inputText = styles("border-1")

export const label = styles("font-semibold");
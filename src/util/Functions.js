export function toTitleCase(str) {
    if (!str) return '';
    return (
        str.trim()
            .replace(/([A-Z]+)([A-Z][a-z])/g, '$1 $2') // Split acronyms from words (APIKey -> API Key)
            .replace(/([a-z])([A-Z])/g, '$1 $2')     // Insert space before uppercase letters
            .replace(/^./, match => match.toUpperCase()) // Capitalize the first letter
    );
}
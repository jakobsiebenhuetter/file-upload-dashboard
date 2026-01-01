import { Spinner } from "../Components/Spinner";

// neue Variable zur Nachverfolgung des aktiven Spinners
let activeSpinner: Spinner | null = null;

export function lockScreen(): Spinner | void {
	// Verhindere mehrfaches Sperren
	if (activeSpinner) return activeSpinner;

	// Scrollen sperren
	document.body.style.overflow = 'hidden';

	const spinner = new Spinner({ backdropOption: true });
	activeSpinner = spinner;
	return spinner;
};

export function unlockScreen(): void {
	// vorhandenen Spinner entfernen (falls vorhanden)
	if (activeSpinner) {
		activeSpinner.destroy();
		activeSpinner = null;
	}

	// Scrollen wieder erlauben
	document.body.style.overflow = 'auto';
}
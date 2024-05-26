require("dotenv").config();
const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');
const BasePage = require('./WebPage'); // Ensure this module is properly implemented with necessary methods

async function sleep(timeInS) {
	await new Promise((resolve) => setTimeout(resolve, timeInS * 1000));
}

async function startBot() {
	try {
		const page = new BasePage();
		let site = 'https://www.linkedin.com';
		await page.visit(site);
		await sleep(5);

		console.log("Attempting to sign in...");
		await page.signin();
		await sleep(20);

		site = 'https://www.linkedin.com/jobs/';
		await page.visit(site);
		await sleep(5);

		console.log("Searching for jobs...");
		await page.searchJobs('Java Developer', 'Hyderabad, India');
		await sleep(5);

		// Automate job applications
		for (let i = 0; i < 10; i++) { // Adjust the loop count as needed
			try {
				console.log(`Attempting to apply for job ${i + 1}`);
				const jobApplied = await page.applyToJob();
				if (jobApplied) {
					console.log('Applied to a job successfully.');
				} else {
					console.log('Skipped a job due to edge cases.');
				}
				await sleep(5); // Adjust the sleep time as necessary
			} catch (e) {
				console.error(`Error during job application ${i + 1}:`, e);
			}
		}
	} catch (e) {
		console.error("Error in startBot function:", e);
	} finally {
		await page.quit();
	}
}

(async () => {
	await startBot();
})();

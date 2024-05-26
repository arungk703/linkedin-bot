const { Builder, By, Key, until } = require('selenium-webdriver');
const chrome = require('selenium-webdriver/chrome');

function initOptions(o) {
  // o.addArguments("headless"); // Uncomment for headless mode
  o.addArguments("disable-infobars");
  o.addArguments("no-sandbox");
  o.addArguments(
    "user-agent=Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/84.0.4147.89 Safari/537.36 RuxitSynthetic/1.0 v6419931773 t38550 ath9b965f92 altpub"
  );
  o.setUserPreferences({
    credential_enable_service: false,
  });
}

class BasePage {
  constructor() {
    let o = new chrome.Options();
    initOptions(o);

    this.driver = new Builder()
      .withCapabilities({ acceptSslCerts: true, acceptInsecureCerts: true })
      .setChromeOptions(o)
      .forBrowser("chrome")
      .build();
  }

  async visit(url) {
    console.log(`Visiting: ${url}`);
    await this.driver.get(url);
  }

  async findById(id) {
    console.log(`Looking for element by ID: ${id}`);
    await this.driver.wait(until.elementLocated(By.id(id)), 15000, "Looking for element");
    return await this.driver.findElement(By.id(id));
  }

  async findByClassName(name) {
    console.log(`Looking for element by class name: ${name}`);
    const els = await this.driver.wait(until.elementsLocated(By.className(name)), 15000, "Looking for element");
    return els[els.length - 1];
  }

  async signin() {
    let name = process.env.USERNAME || "";
    let password = process.env.PASSWORD || "";
    console.log("Filling in username and password");
    let input = await this.findById("session_key");
    await input.sendKeys(name);
    let input2 = await this.findById("session_password");
    await input2.sendKeys(password);
    let button = await this.findByClassName("sign-in-form__submit-btn--full-width");
    await button.click();
  }

  async searchJobs(jobTitle, location) {
    console.log(`Searching for jobs: ${jobTitle} in ${location}`);
    let jobInput = await this.driver.findElement(By.css('.jobs-search-box__text-input[aria-label="Search by title, skill, or company"]'));
    await jobInput.sendKeys(jobTitle);
    let locationInput = await this.driver.findElement(By.css('.jobs-search-box__text-input[aria-label="City, state, or zip code"]'));
    await locationInput.sendKeys(location);
    await locationInput.sendKeys(Key.RETURN);
    await sleep(5); // Wait for search results to load
  }

  async applyToJob() {
    try {
      console.log("Finding a job to apply");
      await this.driver.wait(until.elementLocated(By.css('.job-card-container__link')), 10000).click();
      await sleep(3);

      let easyApplyButton = await this.driver.findElements(By.css('.jobs-apply-button--top-card'));
      if (easyApplyButton.length > 0) {
        await easyApplyButton[0].click();
        await sleep(3);

        // Handle the Easy Apply form steps
        let continueButton;
        do {
          continueButton = await this.driver.findElements(By.css('.artdeco-button--primary'));
          if (continueButton.length > 0) {
            await continueButton[0].click();
            await sleep(3);
          }
        } while (continueButton.length > 0);

        // Fill in the experience, current CTC, and expected CTC
        await this.fillFormFields();

        // Check if there are additional steps like selecting a resume
        let resumeRadioButton = await this.driver.findElements(By.css('input[type="radio"]'));
        if (resumeRadioButton.length > 0) {
          console.log('Selecting the first available resume...');
          await resumeRadioButton[0].click();
          await sleep(3);
        }

        // Handle the review step
        let reviewButton = await this.driver.findElements(By.css('.artdeco-button--primary'));
        if (reviewButton.length > 0) {
          await reviewButton[0].click();
          await sleep(3);
        }

        // Final submit button
        let submitButton = await this.driver.findElements(By.css('.artdeco-button--primary'));
        if (submitButton.length > 0) {
          await submitButton[0].click();
          await sleep(3);
          console.log('Application submitted successfully.');
        } else {
          console.log('No submit button found, skipping this job.');
        }

        // Close the application window
        await this.closeApplicationWindow();
        return true;
      } else {
        console.log('No Easy Apply button found, skipping this job.');
        return false;
      }
    } catch (error) {
      console.error('Error applying to job:', error);
      return false;
    }
  }

  async fillFormFields() {
    try {
      // Fill experience fields
      let experienceInputs = await this.driver.findElements(By.xpath("//label[contains(text(), 'experience') or contains(text(), 'Experience')]//following-sibling::input"));
      for (let input of experienceInputs) {
        await input.clear();
        await input.sendKeys('2');
      }

      // Fill current CTC field
      let currentCtcInput = await this.driver.findElement(By.xpath("//label[contains(text(), 'Current CTC')]//following-sibling::input"));
      if (currentCtcInput) {
        await currentCtcInput.clear();
        await currentCtcInput.sendKeys('790000');
      }

      // Fill expected CTC field
      let expectedCtcInput = await this.driver.findElement(By.xpath("//label[contains(text(), 'Expected CTC')]//following-sibling::input"));
      if (expectedCtcInput) {
        await expectedCtcInput.clear();
        await expectedCtcInput.sendKeys('900000');
      }
    } catch (error) {
      console.error('Error filling form fields:', error);
    }
  }

  async closeApplicationWindow() {
    try {
      let closeButton = await this.driver.findElement(By.css('button.artdeco-modal__dismiss'));
      if (closeButton) {
        await closeButton.click();
        console.log('Closed the application window.');
      }
    } catch (error) {
      console.error('Error closing the application window:', error);
    }
  }

  async quit() {
    console.log("Quitting the browser");
    await this.driver.quit();
  }
}

module.exports = BasePage;

async function sleep(timeInS) {
  await new Promise((resolve) => setTimeout(resolve, timeInS * 1000));
}

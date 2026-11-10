(function () {
  const REGEX_EMAIL = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  const REGEX_PHONE = /^\+380\d{9}$/;

  const feedbackForm = document.getElementById("feedbackForm");

  if (feedbackForm) {
    const username = document.getElementById("username");
    const email = document.getElementById("email");
    const phone = document.getElementById("phone");
    const message = document.getElementById("message");
    const agreement = document.getElementById("agreement");

    const nameError = document.getElementById("nameError");
    const emailError = document.getElementById("emailError");
    const phoneError = document.getElementById("phoneError");
    const messageError = document.getElementById("messageError");
    const agreementError = document.getElementById("agreementError");
    const successModal = document.getElementById("successModal");
    const closeModalBtn = document.getElementById("closeModalBtn");
    const submitButton = feedbackForm.querySelector('button[type="submit"]');

    const textValidators = [
      [username, validateName],
      [email, validateEmail],
      [phone, validatePhone],
      [message, validateMessage],
    ];
    const validators = [...textValidators, [agreement, validateAgreement]];
    const fieldsWithDefaultBorder = new Set(
      validators.map(([field]) => field).filter((field) =>
        field.classList.contains("!border-[#DCE8F0]"),
      ),
    );
    let isModalOpen = false;

    // Hide an error and restore the field's original border class.
    function clearError(field, errorElement) {
      errorElement.textContent = "";
      errorElement.classList.add("hidden");
      field.setAttribute("aria-invalid", "false");
      field.classList.remove("!border-red-500", "!border-green-500");
      if (fieldsWithDefaultBorder.has(field)) {
        field.classList.add("!border-[#DCE8F0]");
      }
    }

    // Display the message associated with an invalid field.
    function showError(field, errorElement, text) {
      field.classList.remove("!border-[#DCE8F0]", "!border-green-500");
      field.setAttribute("aria-invalid", "true");
      errorElement.textContent = text;
      errorElement.classList.remove("hidden");
      field.classList.add("!border-red-500");
    }

    // Mark a valid field with a green border.
    function showSuccess(field, errorElement) {
      clearError(field, errorElement);
      field.classList.remove("!border-[#DCE8F0]");
      field.classList.add("!border-green-500");
    }

    function validateName() {
      if (username.value.trim().length < 2) {
        showError(username, nameError, "Введіть ім’я (не менше 2 символів).");
        return false;
      }

      showSuccess(username, nameError);
      return true;
    }

    function validateEmail() {
      if (!REGEX_EMAIL.test(email.value.trim())) {
        showError(email, emailError, "Введіть коректну адресу емейлу.");
        return false;
      }

      showSuccess(email, emailError);
      return true;
    }

    function getPhoneErrorMessage(value) {
      if (value.length === 0) {
        return "Введіть номер у форматі +380XXXXXXXXX.";
      }

      if (/\s/.test(value)) {
        return "Приберіть пробіли: номер потрібно ввести без пробілів.";
      }

      if (/[()]/.test(value)) {
        return "Приберіть дужки та введіть номер лише цифрами після +380.";
      }

      if (/^0/.test(value)) {
        return "Номер має починатися з +380, а не з 0.";
      }

      if (value.startsWith("+380")) {
        const nationalNumber = value.slice(4);

        if (/\D/.test(nationalNumber)) {
          return "Після +380 використовуйте лише цифри.";
        }

        if (nationalNumber.length > 9) {
          return "Після +380 має бути рівно 9 цифр. Видаліть зайві цифри.";
        }

        const remainingDigits = 9 - nationalNumber.length;
        const digitsWord =
          remainingDigits === 1
            ? "цифру"
            : remainingDigits >= 2 && remainingDigits <= 4
              ? "цифри"
              : "цифр";

        return `Номер неповний: після +380 введіть ще ${remainingDigits} ${digitsWord}.`;
      }

      if (/\D/.test(value)) {
        return "Використовуйте лише цифри та префікс +380 без пробілів і розділових знаків.";
      }

      return "Введіть номер у форматі +380XXXXXXXXX.";
    }

    function validatePhone() {
      if (!REGEX_PHONE.test(phone.value)) {
        showError(phone, phoneError, getPhoneErrorMessage(phone.value));
        return false;
      }

      showSuccess(phone, phoneError);
      return true;
    }

    function validateMessage() {
      if (message.value.trim().length < 10) {
        showError(message, messageError, "Повідомлення має містити не менше 10 символів.");
        return false;
      }

      showSuccess(message, messageError);
      return true;
    }

    function validateAgreement() {
      if (!agreement.checked) {
        showError(agreement, agreementError, "Потрібно погодитися з політикою конфіденційності.");
        return false;
      }

      showSuccess(agreement, agreementError);
      return true;
    }

    function resetValidationUI() {
      [
        [username, nameError],
        [email, emailError],
        [phone, phoneError],
        [message, messageError],
        [agreement, agreementError],
      ].forEach(([field, errorElement]) => {
        clearError(field, errorElement);
        field.classList.add("!border-[#DCE8F0]");
      });
    }

    function openSuccessModal() {
      isModalOpen = true;
      successModal.classList.remove("hidden");
      closeModalBtn.focus();
    }

    function closeSuccessModal() {
      if (!isModalOpen) {
        return;
      }

      isModalOpen = false;
      successModal.classList.add("hidden");
      submitButton.focus();
    }

    closeModalBtn.addEventListener("click", closeSuccessModal);

    successModal.addEventListener("click", (event) => {
      if (event.target === successModal) {
        closeSuccessModal();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (!isModalOpen) {
        return;
      }

      if (event.key === "Escape") {
        closeSuccessModal();
        return;
      }

      if (event.key === "Tab") {
        event.preventDefault();
        closeModalBtn.focus();
      }
    });

    // Start live validation after the first interaction with a field.
    textValidators.forEach(([field, validate]) => {
      field.addEventListener("input", () => {
        validate();
      });

      field.addEventListener("blur", () => {
        validate();
      });
    });

    agreement.addEventListener("change", () => {
      validateAgreement();
    });

    feedbackForm.addEventListener("submit", (event) => {
      event.preventDefault();

      if (isModalOpen) {
        return;
      }

      let firstInvalidField = null;

      validators.forEach(([field, validate]) => {
        if (!validate() && firstInvalidField === null) {
          firstInvalidField = field;
        }
      });

      if (firstInvalidField) {
        firstInvalidField.focus();
        return;
      }

      feedbackForm.reset();
      resetValidationUI();
      openSuccessModal();
    });
  }
})();

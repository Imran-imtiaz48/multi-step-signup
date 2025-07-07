document.addEventListener('DOMContentLoaded', function () {
    let currentStep = 1;
    const totalSteps = 3;

    const formData = {
        fullName: '',
        email: '',
        agreeTerms: false
    };

    const steps = document.querySelectorAll('.form-step');
    const stepIndicators = document.querySelectorAll('.step');
    const progressBar = document.querySelector('.progress');

    const inputs = {
        fullName: document.getElementById('fullName'),
        email: document.getElementById('email'),
        password: document.getElementById('password'),
        confirmPassword: document.getElementById('confirmPassword'),
        agreeTerms: document.getElementById('agreeTerms')
    };

    const messages = {
        fullName: document.getElementById('fullNameValidation'),
        email: document.getElementById('emailValidation'),
        password: document.getElementById('passwordValidation'),
        confirmPassword: document.getElementById('confirmPasswordValidation'),
        terms: document.getElementById('termsValidation')
    };

    const strength = {
        bar: document.getElementById('strengthBar'),
        text: document.getElementById('strengthText'),
        requirements: {
            length: document.getElementById('length'),
            uppercase: document.getElementById('uppercase'),
            lowercase: document.getElementById('lowercase'),
            number: document.getElementById('number'),
            special: document.getElementById('special')
        }
    };

    const buttons = {
        toStep2: document.getElementById('toStep2'),
        backToStep1: document.getElementById('backToStep1'),
        toStep3: document.getElementById('toStep3'),
        backToStep2: document.getElementById('backToStep2'),
        submit: document.getElementById('submitForm'),
        login: document.getElementById('loginBtn')
    };

    function init() {
        buttons.toStep2.addEventListener('click', () => validateAndGoToStep(2));
        buttons.backToStep1.addEventListener('click', () => goToStep(1));
        buttons.toStep3.addEventListener('click', () => validateAndGoToStep(3));
        buttons.backToStep2.addEventListener('click', () => goToStep(2));
        buttons.submit.addEventListener('click', submitForm);
        buttons.login.addEventListener('click', () => alert('Would redirect to login'));

        inputs.fullName.addEventListener('input', validateFullName);
        inputs.email.addEventListener('input', validateEmail);
        inputs.password.addEventListener('input', validatePassword);
        inputs.confirmPassword.addEventListener('input', validateConfirmPassword);
        inputs.agreeTerms.addEventListener('change', validateTerms);

        document.querySelectorAll('.toggle-password').forEach(btn => {
            btn.addEventListener('click', togglePasswordVisibility);
        });

        restoreFormData();
        updateProgressBar();
        setupKeyboardNavigation();
    }

    function validateFullName() {
        const name = inputs.fullName.value.trim();
        if (!name) return showError('fullName', 'Full name is required');
        if (name.length < 2) return showError('fullName', 'Name must be at least 2 characters');

        clearError('fullName');
        formData.fullName = name;
        return true;
    }

    function validateEmail() {
        const email = inputs.email.value.trim();
        const pattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!email) return showError('email', 'Email address is required');
        if (!pattern.test(email)) return showError('email', 'Please enter a valid email');

        clearError('email');
        formData.email = email;
        return true;
    }

    function validatePassword() {
        const pw = inputs.password.value;
        const conditions = {
            length: pw.length >= 8,
            uppercase: /[A-Z]/.test(pw),
            lowercase: /[a-z]/.test(pw),
            number: /[0-9]/.test(pw),
            special: /[!@#$%^&*(),.?":{}|<>]/.test(pw)
        };

        Object.entries(conditions).forEach(([key, valid]) => updateRequirement(strength.requirements[key], valid));

        const met = Object.values(conditions).filter(Boolean).length;
        updateStrengthBar(met);

        if (!pw) return showError('password', 'Password is required');
        if (met < 5) return showError('password', 'Please meet all password requirements');

        clearError('password');
        return true;
    }

    function validateConfirmPassword() {
        const match = inputs.confirmPassword.value === inputs.password.value;
        if (!inputs.confirmPassword.value) return showError('confirmPassword', 'Confirm your password');
        if (!match) return showError('confirmPassword', 'Passwords do not match');

        clearError('confirmPassword');
        return true;
    }

    function validateTerms() {
        const checked = inputs.agreeTerms.checked;
        if (!checked) return showError('terms', 'You must agree to the terms');
        clearError('terms');
        formData.agreeTerms = true;
        return true;
    }

    function validateAndGoToStep(step) {
        const validations = {
            1: () => validateFullName() && validateEmail(),
            2: () => validatePassword() && validateConfirmPassword(),
            3: () => validateTerms()
        };

        if (validations[currentStep]()) {
            goToStep(step);
        }
    }

    function goToStep(step) {
        steps.forEach(s => s.classList.remove('active'));
        document.getElementById(`step${step}`).classList.add('active');
        currentStep = step;
        updateProgressBar();
        updateStepIndicators();
        saveFormData();
    }

    function updateStepIndicators() {
        stepIndicators.forEach((el, idx) => {
            const stepNum = idx + 1;
            const numberSpan = el.querySelector('.step-number');
            el.classList.remove('active', 'completed');

            if (stepNum === currentStep) {
                el.classList.add('active');
                numberSpan.textContent = stepNum;
            } else if (stepNum < currentStep) {
                el.classList.add('completed');
                numberSpan.innerHTML = '<i class="fas fa-check"></i>';
            } else {
                numberSpan.textContent = stepNum;
            }
        });
    }

    function updateProgressBar() {
        progressBar.style.width = `${((currentStep - 1) / (totalSteps - 1)) * 100}%`;
    }

    function updateRequirement(el, valid) {
        const icon = el.querySelector('i');
        icon.className = valid ? 'fas fa-check-circle' : 'fas fa-times-circle';
        el.style.color = valid ? 'var(--success-color)' : 'var(--light-text)';
    }

    function updateStrengthBar(level) {
        const levels = [
            { width: '20%', color: '#ef4444', text: 'Very weak' },
            { width: '40%', color: '#f59e0b', text: 'Weak' },
            { width: '60%', color: '#f59e0b', text: 'Moderate' },
            { width: '80%', color: '#84cc16', text: 'Strong' },
            { width: '100%', color: '#10b981', text: 'Very strong' }
        ];
        if (level > 0) {
            const info = levels[level - 1];
            strength.bar.style.width = info.width;
            strength.bar.style.backgroundColor = info.color;
            strength.text.textContent = info.text;
        } else {
            strength.bar.style.width = '0%';
            strength.text.textContent = 'Password strength';
        }
    }

    function showError(field, msg) {
        inputs[field].classList.add('error');
        messages[field].textContent = msg;
        return false;
    }

    function clearError(field) {
        inputs[field].classList.remove('error');
        messages[field].textContent = '';
    }

    function togglePasswordVisibility(e) {
        const input = e.currentTarget.closest('.input-group').querySelector('input');
        const icon = e.currentTarget.querySelector('i');
        const isVisible = input.type === 'text';

        input.type = isVisible ? 'password' : 'text';
        icon.className = isVisible ? 'fas fa-eye-slash' : 'fas fa-eye';
    }

    function setupKeyboardNavigation() {
        document.addEventListener('keydown', e => {
            if (e.key === 'Enter') {
                if (currentStep < 3) validateAndGoToStep(currentStep + 1);
                else submitForm();
            }
            if (e.key === 'Escape') {
                if (currentStep > 1) goToStep(currentStep - 1);
            }
        });
    }

    function submitForm() {
        if (!validateTerms()) return;

        buttons.submit.disabled = true;
        buttons.submit.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating account...';

        setTimeout(() => {
            buttons.submit.disabled = false;
            buttons.submit.innerHTML = 'Create Account <i class="fas fa-check"></i>';
            steps.forEach(s => s.classList.remove('active'));
            document.getElementById('success').classList.add('active');
            window.signupFormState = null;

            console.log('Form submitted:', {
                fullName: formData.fullName,
                email: formData.email,
                termsAccepted: formData.agreeTerms
            });
        }, 1500);
    }

    function saveFormData() {
        window.signupFormState = JSON.stringify({
            currentStep,
            data: {
                fullName: formData.fullName,
                email: formData.email,
                agreeTerms: formData.agreeTerms
            }
        });
    }

    function restoreFormData() {
        try {
            if (window.signupFormState) {
                const saved = JSON.parse(window.signupFormState);
                inputs.fullName.value = saved.data.fullName || '';
                inputs.email.value = saved.data.email || '';
                inputs.agreeTerms.checked = saved.data.agreeTerms || false;
                goToStep(saved.currentStep || 1);
            }
        } catch (err) {
            console.warn('Could not restore form state');
        }
    }

    init();
});

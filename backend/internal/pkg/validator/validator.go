package validator

import (
	"regexp"
	"strings"
	"unicode"
)

var (
	emailRegex    = regexp.MustCompile(`^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$`)
	usernameRegex = regexp.MustCompile(`^[a-zA-Z0-9_-]{3,50}$`)
	walletRegex   = regexp.MustCompile(`^[1-9A-HJ-NP-Za-km-z]{32,44}$`) // Base58 Solana address
)

type ValidationError struct {
	Field   string `json:"field"`
	Message string `json:"message"`
}

type ValidationErrors []ValidationError

func (v ValidationErrors) Error() string {
	var messages []string
	for _, err := range v {
		messages = append(messages, err.Field+": "+err.Message)
	}
	return strings.Join(messages, "; ")
}

func (v ValidationErrors) ToMap() map[string]string {
	result := make(map[string]string)
	for _, err := range v {
		result[err.Field] = err.Message
	}
	return result
}

// ValidateEmail validates an email address
func ValidateEmail(email string) bool {
	return emailRegex.MatchString(email)
}

// ValidateUsername validates a username
func ValidateUsername(username string) bool {
	return usernameRegex.MatchString(username)
}

// ValidatePassword validates password strength
func ValidatePassword(password string) []string {
	var errors []string

	if len(password) < 8 {
		errors = append(errors, "password must be at least 8 characters")
	}

	var hasUpper, hasLower, hasNumber bool
	for _, char := range password {
		switch {
		case unicode.IsUpper(char):
			hasUpper = true
		case unicode.IsLower(char):
			hasLower = true
		case unicode.IsNumber(char):
			hasNumber = true
		}
	}

	if !hasUpper {
		errors = append(errors, "password must contain at least one uppercase letter")
	}
	if !hasLower {
		errors = append(errors, "password must contain at least one lowercase letter")
	}
	if !hasNumber {
		errors = append(errors, "password must contain at least one number")
	}

	return errors
}

// ValidateWalletAddress validates a Solana wallet address (Base58)
func ValidateWalletAddress(address string) bool {
	return walletRegex.MatchString(address)
}

// ValidateRequired checks if a string is not empty
func ValidateRequired(value, fieldName string) *ValidationError {
	if strings.TrimSpace(value) == "" {
		return &ValidationError{
			Field:   fieldName,
			Message: fieldName + " is required",
		}
	}
	return nil
}

// ValidateMinLength checks minimum string length
func ValidateMinLength(value, fieldName string, min int) *ValidationError {
	if len(strings.TrimSpace(value)) < min {
		return &ValidationError{
			Field:   fieldName,
			Message: fieldName + " must be at least " + string(rune(min+'0')) + " characters",
		}
	}
	return nil
}

// ValidateMaxLength checks maximum string length
func ValidateMaxLength(value, fieldName string, max int) *ValidationError {
	if len(value) > max {
		return &ValidationError{
			Field:   fieldName,
			Message: fieldName + " must not exceed " + string(rune(max)) + " characters",
		}
	}
	return nil
}

// Validator provides a chainable validation interface
type Validator struct {
	errors ValidationErrors
}

func New() *Validator {
	return &Validator{}
}

func (v *Validator) Required(value, field string) *Validator {
	if err := ValidateRequired(value, field); err != nil {
		v.errors = append(v.errors, *err)
	}
	return v
}

func (v *Validator) Email(email, field string) *Validator {
	if email != "" && !ValidateEmail(email) {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "invalid email format",
		})
	}
	return v
}

func (v *Validator) Username(username, field string) *Validator {
	if username != "" && !ValidateUsername(username) {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "username must be 3-50 characters, alphanumeric with underscores and hyphens",
		})
	}
	return v
}

func (v *Validator) Password(password, field string) *Validator {
	if errs := ValidatePassword(password); len(errs) > 0 {
		for _, err := range errs {
			v.errors = append(v.errors, ValidationError{
				Field:   field,
				Message: err,
			})
		}
	}
	return v
}

func (v *Validator) WalletAddress(address, field string) *Validator {
	if address != "" && !ValidateWalletAddress(address) {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: "invalid Solana wallet address",
		})
	}
	return v
}

func (v *Validator) MinLength(value, field string, min int) *Validator {
	if err := ValidateMinLength(value, field, min); err != nil {
		v.errors = append(v.errors, *err)
	}
	return v
}

func (v *Validator) MaxLength(value, field string, max int) *Validator {
	if err := ValidateMaxLength(value, field, max); err != nil {
		v.errors = append(v.errors, *err)
	}
	return v
}

func (v *Validator) Valid() bool {
	return len(v.errors) == 0
}

func (v *Validator) Errors() ValidationErrors {
	return v.errors
}

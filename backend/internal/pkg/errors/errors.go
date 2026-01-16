package errors

import (
	"errors"
	"fmt"
	"net/http"
)

// Common errors
var (
	ErrNotFound          = errors.New("resource not found")
	ErrUnauthorized      = errors.New("unauthorized")
	ErrForbidden         = errors.New("forbidden")
	ErrBadRequest        = errors.New("bad request")
	ErrConflict          = errors.New("resource already exists")
	ErrInternal          = errors.New("internal server error")
	ErrValidation        = errors.New("validation error")
	ErrInvalidCredentials = errors.New("invalid credentials")
	ErrTokenExpired      = errors.New("token expired")
	ErrInvalidToken      = errors.New("invalid token")
	ErrWalletNotVerified = errors.New("wallet not verified")
	ErrInsufficientFunds = errors.New("insufficient funds")
	ErrEscrowNotFunded   = errors.New("escrow not funded")
	ErrInvalidSignature  = errors.New("invalid signature")
)

// AppError represents an application error with HTTP status
type AppError struct {
	Err        error
	Message    string
	StatusCode int
	Details    map[string]interface{}
}

func (e *AppError) Error() string {
	if e.Message != "" {
		return e.Message
	}
	return e.Err.Error()
}

func (e *AppError) Unwrap() error {
	return e.Err
}

// Error constructors
func NewBadRequest(message string) *AppError {
	return &AppError{
		Err:        ErrBadRequest,
		Message:    message,
		StatusCode: http.StatusBadRequest,
	}
}

func NewNotFound(resource string) *AppError {
	return &AppError{
		Err:        ErrNotFound,
		Message:    fmt.Sprintf("%s not found", resource),
		StatusCode: http.StatusNotFound,
	}
}

func NewUnauthorized(message string) *AppError {
	if message == "" {
		message = "unauthorized"
	}
	return &AppError{
		Err:        ErrUnauthorized,
		Message:    message,
		StatusCode: http.StatusUnauthorized,
	}
}

func NewForbidden(message string) *AppError {
	if message == "" {
		message = "access denied"
	}
	return &AppError{
		Err:        ErrForbidden,
		Message:    message,
		StatusCode: http.StatusForbidden,
	}
}

func NewConflict(message string) *AppError {
	return &AppError{
		Err:        ErrConflict,
		Message:    message,
		StatusCode: http.StatusConflict,
	}
}

func NewInternal(err error) *AppError {
	return &AppError{
		Err:        err,
		Message:    "internal server error",
		StatusCode: http.StatusInternalServerError,
	}
}

func NewValidation(details map[string]interface{}) *AppError {
	return &AppError{
		Err:        ErrValidation,
		Message:    "validation failed",
		StatusCode: http.StatusUnprocessableEntity,
		Details:    details,
	}
}

// IsAppError checks if error is an AppError
func IsAppError(err error) bool {
	var appErr *AppError
	return errors.As(err, &appErr)
}

// GetAppError returns the AppError if present
func GetAppError(err error) *AppError {
	var appErr *AppError
	if errors.As(err, &appErr) {
		return appErr
	}
	return nil
}

// BadRequestError represents a bad request error with custom message
type BadRequestError struct {
	Message string
}

func (e *BadRequestError) Error() string {
	return e.Message
}

func NewBadRequestError(message string) *BadRequestError {
	return &BadRequestError{Message: message}
}

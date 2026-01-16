package middleware

import (
	"net/http"
)

type CORSConfig struct {
	AllowedOrigins   []string
	AllowedMethods   []string
	AllowedHeaders   []string
	ExposedHeaders   []string
	AllowCredentials bool
	MaxAge           int
}

func DefaultCORSConfig() CORSConfig {
	return CORSConfig{
		AllowedOrigins:   []string{"*"},
		AllowedMethods:   []string{"GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"},
		AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-Requested-With"},
		ExposedHeaders:   []string{"Link", "X-Total-Count"},
		AllowCredentials: true,
		MaxAge:           300, // 5 minutes
	}
}

func CORS(config CORSConfig) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			origin := r.Header.Get("Origin")

			// Check if origin is allowed
			allowed := false
			for _, o := range config.AllowedOrigins {
				if o == "*" || o == origin {
					allowed = true
					break
				}
			}

			if allowed {
				w.Header().Set("Access-Control-Allow-Origin", origin)
			}

			if config.AllowCredentials {
				w.Header().Set("Access-Control-Allow-Credentials", "true")
			}

			// Handle preflight requests
			if r.Method == "OPTIONS" {
				// Set allowed methods
				methods := ""
				for i, m := range config.AllowedMethods {
					if i > 0 {
						methods += ", "
					}
					methods += m
				}
				w.Header().Set("Access-Control-Allow-Methods", methods)

				// Set allowed headers
				headers := ""
				for i, h := range config.AllowedHeaders {
					if i > 0 {
						headers += ", "
					}
					headers += h
				}
				w.Header().Set("Access-Control-Allow-Headers", headers)

				// Set exposed headers
				if len(config.ExposedHeaders) > 0 {
					exposed := ""
					for i, h := range config.ExposedHeaders {
						if i > 0 {
							exposed += ", "
						}
						exposed += h
					}
					w.Header().Set("Access-Control-Expose-Headers", exposed)
				}

				// Set max age
				if config.MaxAge > 0 {
					w.Header().Set("Access-Control-Max-Age", string(rune(config.MaxAge)))
				}

				w.WriteHeader(http.StatusNoContent)
				return
			}

			next.ServeHTTP(w, r)
		})
	}
}

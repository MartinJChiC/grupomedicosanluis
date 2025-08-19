// Menú hamburguesa para móviles
        function toggleMenu() {
            const navMenu = document.querySelector('.nav-menu');
            navMenu.classList.toggle('active');
        }

        // Smooth scrolling para enlaces del menú
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
                
                // Cerrar menú móvil después del click
                const navMenu = document.querySelector('.nav-menu');
                navMenu.classList.remove('active');
            });
        });

        // Validación y manejo del formulario
        document.addEventListener('DOMContentLoaded', function() {
            const form = document.getElementById('contact-form');
            const submitBtn = document.getElementById('submit-btn');
            const btnText = document.getElementById('btn-text');
            const loadingSpinner = document.getElementById('loading-spinner');
            const formMessage = document.getElementById('form-message');

            // Función para mostrar mensajes
            function showMessage(message, type) {
                formMessage.textContent = message;
                formMessage.className = `message ${type} show`;
                setTimeout(() => {
                    formMessage.classList.remove('show');
                }, 5000);
            }

            // Función para validar email
            function isValidEmail(email) {
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                return emailRegex.test(email);
            }

            // Función para validar teléfono (formato mexicano básico)
            function isValidPhone(phone) {
                const phoneRegex = /^[\d\s\-\+\(\)]{10,15}$/;
                return phoneRegex.test(phone.replace(/\s/g, ''));
            }

            // Función para limpiar errores
            function clearErrors() {
                document.querySelectorAll('.form-group').forEach(group => {
                    group.classList.remove('error');
                });
            }

            // Función para mostrar error en un campo
            function showFieldError(fieldName, message) {
                const field = document.querySelector(`[name="${fieldName}"]`);
                const formGroup = field.closest('.form-group');
                const errorMessage = formGroup.querySelector('.error-message');
                
                formGroup.classList.add('error');
                if (message) {
                    errorMessage.textContent = message;
                }
            }

            // Validar formulario
            function validateForm(formData) {
                clearErrors();
                let isValid = true;

                // Validar nombre
                if (!formData.get('nombre') || formData.get('nombre').trim().length < 2) {
                    showFieldError('nombre', 'El nombre debe tener al menos 2 caracteres');
                    isValid = false;
                }

                // Validar teléfono
                if (!formData.get('telefono') || !isValidPhone(formData.get('telefono'))) {
                    showFieldError('telefono', 'Por favor ingresa un número de teléfono válido');
                    isValid = false;
                }

                // Validar email
                if (!formData.get('email') || !isValidEmail(formData.get('email'))) {
                    showFieldError('email', 'Por favor ingresa un email válido');
                    isValid = false;
                }

                // Validar servicio
                if (!formData.get('servicio')) {
                    showFieldError('servicio', 'Por favor selecciona un servicio');
                    isValid = false;
                }

                return isValid;
            }

            // Enviar a WhatsApp
            function submitForm(formData) {
                // Número de WhatsApp de la clínica (cambiar por el número real)
                const whatsappNumber = "5219861150227"; // Número con código de país México (+52)
                
                // Construir mensaje para WhatsApp
                const nombre = formData.get('nombre');
                const telefono = formData.get('telefono');
                const email = formData.get('email');
                const servicio = formData.get('servicio');
                const mensaje = formData.get('mensaje') || 'Sin mensaje adicional';
                
                // Mapear servicios a nombres legibles
                const servicios = {
                    'medicina-interna': 'Medicina Interna',
                    'ultrasonidos': 'Ultrasonidos',
                    'ginecologia': 'Ginecología y Obstetricia',
                    'pediatria': 'Pediatría',
                    'laboratorio': 'Laboratorio'
                };
                
                const servicioNombre = servicios[servicio] || servicio;
                
                // Crear mensaje formateado
                const whatsappMessage = `🏥 *NUEVA CITA - Grupo Médico San Luis*
                
👤 *Nombre:* ${nombre}
📞 *Teléfono:* ${telefono}
📧 *Email:* ${email}
🩺 *Servicio:* ${servicioNombre}

💬 *Mensaje:*
${mensaje}

---
_Enviado desde la página web_`;

                // Codificar mensaje para URL
                const encodedMessage = encodeURIComponent(whatsappMessage);
                
                // Crear URL de WhatsApp
                const whatsappURL = `https://wa.me/${whatsappNumber}?text=${encodedMessage}`;
                
                // Abrir WhatsApp
                window.open(whatsappURL, '_blank');
                
                return Promise.resolve({ 
                    success: true, 
                    message: '¡Perfecto! Te redirigimos a WhatsApp para completar tu solicitud de cita.' 
                });
            }

            // Manejar envío del formulario
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                const formData = new FormData(form);
                
                // Validar formulario
                if (!validateForm(formData)) {
                    showMessage('Por favor corrige los errores en el formulario', 'error');
                    return;
                }

                // Mostrar estado de carga
                submitBtn.disabled = true;
                loadingSpinner.style.display = 'inline-block';
                btnText.textContent = 'Preparando WhatsApp...';

                try {
                    // Pequeño delay para mostrar el loading
                    await new Promise(resolve => setTimeout(resolve, 1000));
                    
                    const result = await submitForm(formData);
                    
                    if (result.success) {
                        showMessage(result.message, 'success');
                        form.reset(); // Limpiar formulario
                    }
                } catch (error) {
                    showMessage('Error al abrir WhatsApp. Por favor intenta nuevamente.', 'error');
                } finally {
                    // Restaurar estado del botón
                    submitBtn.disabled = false;
                    loadingSpinner.style.display = 'none';
                    btnText.textContent = '📱 Enviar a WhatsApp';
                }
            });

            // Limpiar errores cuando el usuario empiece a escribir
            form.addEventListener('input', function(e) {
                if (e.target.closest('.form-group').classList.contains('error')) {
                    e.target.closest('.form-group').classList.remove('error');
                }
            });

            // Auto-formatear teléfono mientras el usuario escribe
            const phoneInput = document.getElementById('telefono');
            phoneInput.addEventListener('input', function(e) {
                let value = e.target.value.replace(/\D/g, ''); // Remover no-dígitos
                
                // Formatear número mexicano básico
                if (value.length >= 10) {
                    value = value.substring(0, 10);
                    value = value.replace(/(\d{3})(\d{3})(\d{4})/, '$1 $2 $3');
                }
                
                e.target.value = value;
            });

            // Validación en tiempo real para email
            const emailInput = document.getElementById('email');
            emailInput.addEventListener('blur', function(e) {
                const formGroup = e.target.closest('.form-group');
                if (e.target.value && !isValidEmail(e.target.value)) {
                    formGroup.classList.add('error');
                } else if (formGroup.classList.contains('error') && isValidEmail(e.target.value)) {
                    formGroup.classList.remove('error');
                }
            });
        });
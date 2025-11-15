<template>
  <q-page class="login-bg">

    <!-- LOGO GIGANTE DE FONDO -->
    <div class="background-logo"></div>

    <div class="hex-container animate-zoom">
      <div class="hex-card">

        <div class="hex-avatar">
          <q-icon name="person" size="62px" />
        </div>

        <h2 class="login-title">Iniciar Sesión</h2>

        <q-form @submit.prevent="onSubmit" class="q-gutter-md">

          <q-input
            filled
            v-model="email"
            label="Correo / Usuario"
            dense
            class="input-field"
            :rules="[v => !!v || 'Campo obligatorio']"
          >
            <template #prepend>
              <q-icon name="mail" />
            </template>
          </q-input>

          <q-input
            filled
            v-model="password"
            :type="showPassword ? 'text' : 'password'"
            label="Contraseña"
            dense
            class="input-field"
            :rules="[v => !!v || 'Campo obligatorio']"
          >
            <template #prepend>
              <q-icon name="lock" />
            </template>

            <template #append>
              <q-icon
                :name="showPassword ? 'visibility_off' : 'visibility'"
                class="cursor-pointer"
                @click="showPassword = !showPassword"
              />
            </template>
          </q-input>

          <q-btn
            color="primary"
            label="INGRESAR"
            class="login-btn"
            type="submit"
            :loading="loading"
          />

        </q-form>

        <q-banner
          v-if="errorMsg"
          class="q-mt-md bg-red-1 text-red-9"
          rounded
          dense
        >
          <q-icon name="error" class="q-mr-sm" />
          {{ errorMsg }}
        </q-banner>

      </div>
    </div>

  </q-page>
</template>
<script setup>
import { ref } from "vue"
import { useRouter } from "vue-router"
import { useUserStore } from "src/stores/userStore"

const router = useRouter()
const userStore = useUserStore()

// VARIABLES REACTIVAS
const email = ref("")
const password = ref("")
const showPassword = ref(false)
const loading = ref(false)
const errorMsg = ref("")

// MÉTODO SUBMIT
async function onSubmit() {
  errorMsg.value = ""
  loading.value = true

  try {
    const ok = await userStore.login({
      email: email.value,
      contrasena: password.value
    })

    if (ok) {
      router.push("/solconsa/dashboard")
    } else {
      errorMsg.value = "Usuario o contraseña incorrectos"
    }

  } catch (err) {
    console.error("Error login:", err)
    errorMsg.value = "Usuario o contraseña incorrectos"
  } finally {
    loading.value = false
  }
}
</script>
<style scoped>

/* =============================
   FONDO GENERAL COMPLETO
============================= */
.login-bg {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background: linear-gradient(145deg, #5f9cd8, #d8a25c);
  overflow: hidden;
  position: relative;
}

/* LOGO GIGANTE FONDO (marca de agua) */
.background-logo {
  position: absolute;
  width: 95%;
  height: 95%;
  background-image: url('../assets/img/solcon.png');
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  opacity: 0.08;
  filter: blur(2px);
  z-index: 0;
}

/* =============================
   HEXAGON GLASS CARD
============================= */
.hex-container {
  position: relative;
  z-index: 10;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hex-card {
  width: 380px;
  padding: 40px 32px;
  background: rgba(255,255,255,0.15);
  border: 1.5px solid rgba(255,255,255,0.25);
  border-radius: 22px;
  backdrop-filter: blur(14px);
  -webkit-backdrop-filter: blur(14px);
  text-align: center;
  box-shadow: 0 12px 32px rgba(0,0,0,.22);
  clip-path: polygon(
    25% 0%, 75% 0%,
    100% 50%,
    75% 100%, 25% 100%,
    0% 50%
  );
}

/* ICONO SUPERIOR */
.hex-avatar {
  margin-bottom: 10px;
  color: #ffffff;
  opacity: 0.85;
}

/* TÍTULO */
.login-title {
  font-size: 22px;
  font-weight: 800;
  margin-bottom: 22px;
  color: #ffffff;
}

/* CAMPOS DE INPUT */
.input-field .q-field__control {
  border-radius: 12px !important;
  background: rgba(255,255,255,0.25);
  backdrop-filter: blur(10px);
  color: #fff !important;
}

/* BOTÓN */
.login-btn {
  width: 100%;
  height: 44px;
  font-weight: 700;
  border-radius: 12px;
  background: #015ec9 !important;
  box-shadow: 0 4px 14px rgba(0,0,0,.25);
}

.login-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 18px rgba(0,0,0,.35);
}

/* =============================
   ANIMACIÓN
============================= */
.animate-zoom {
  animation: zoomIn .8s ease forwards;
}

@keyframes zoomIn {
  from { opacity: 0; transform: scale(.88); }
  to { opacity: 1; transform: scale(1); }
}

/* =============================
   RESPONSIVE
============================= */
@media (max-width: 480px) {
  .hex-card {
    width: 90%;
    clip-path: none;
    border-radius: 20px;
  }
}
</style>

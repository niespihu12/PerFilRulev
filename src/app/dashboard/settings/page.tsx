"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect, useState } from "react"
import { useUser, useFirestore, useCollection, useMemoFirebase } from "@/firebase"
import { doc, setDoc, collection, query, where } from "firebase/firestore"
import { updateProfile, updateEmail, updatePassword, reauthenticateWithCredential, EmailAuthProvider } from "firebase/auth"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"
import { Separator } from "@/components/ui/separator"

const settingsSchema = z.object({
  needsPercentage: z.number().min(0).max(100),
  wantsPercentage: z.number().min(0).max(100),
  savingsPercentage: z.number().min(0).max(100),
}).refine(data => data.needsPercentage + data.wantsPercentage + data.savingsPercentage === 100, {
  message: "Los porcentajes deben sumar 100.",
  path: ["needsPercentage"],
})

const profileSchema = z.object({
  name: z.string().min(2, "El nombre debe tener al menos 2 caracteres."),
  email: z.string().email("Por favor, introduce un correo electrónico válido."),
})

const passwordSchema = z.object({
  currentPassword: z.string().min(1, "La contraseña actual es obligatoria."),
  newPassword: z.string().min(6, "La nueva contraseña debe tener al menos 6 caracteres."),
})

type SettingsFormValues = z.infer<typeof settingsSchema>
type ProfileFormValues = z.infer<typeof profileSchema>
type PasswordFormValues = z.infer<typeof passwordSchema>

export default function SettingsPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()
  const [isProfileSaving, setIsProfileSaving] = useState(false)
  const [isPasswordSaving, setIsPasswordSaving] = useState(false)

  const configQuery = useMemoFirebase(() =>
    user ? query(collection(firestore, "users", user.uid, "configuration"), where("userId", "==", user.uid)) : null
  , [firestore, user])

  const { data: configData, isLoading: isConfigLoading } = useCollection(configQuery)
  const config = configData?.[0]

  const settingsForm = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      needsPercentage: 50,
      wantsPercentage: 30,
      savingsPercentage: 20,
    },
  })

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      name: user?.displayName || "",
      email: user?.email || "",
    },
  })

  const passwordForm = useForm<PasswordFormValues>({
    resolver: zodResolver(passwordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
    },
  })

  useEffect(() => {
    if (config) {
      settingsForm.reset({
        needsPercentage: config.needsPercentage,
        wantsPercentage: config.wantsPercentage,
        savingsPercentage: config.savingsPercentage,
      })
    }
    if (user) {
      profileForm.reset({
        name: user.displayName || "",
        email: user.email || "",
      })
    }
  }, [config, user, settingsForm, profileForm])

  const onBudgetSubmit = async (data: SettingsFormValues) => {
    if (!user) return

    const configRef = doc(firestore, "users", user.uid, "configuration", config?.id || "main")

    try {
      await setDoc(configRef, { ...data, userId: user.uid }, { merge: true })
      toast({
        title: "Configuración Guardada",
        description: "Tus porcentajes de presupuesto han sido actualizados.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la configuración del presupuesto.",
      })
    }
  }

  const onProfileSubmit = async (data: ProfileFormValues) => {
    if (!user) return
    setIsProfileSaving(true)

    try {
      if (user.displayName !== data.name) {
        await updateProfile(user, { displayName: data.name })
      }
      toast({
        title: "Perfil Actualizado",
        description: "Tu información de perfil ha sido guardada.",
      })
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar el perfil.",
      })
    } finally {
      setIsProfileSaving(false)
    }
  }

  const onPasswordSubmit = async (data: PasswordFormValues) => {
    if (!user || !user.email) return
    setIsPasswordSaving(true)

    try {
      const credential = EmailAuthProvider.credential(user.email, data.currentPassword)
      await reauthenticateWithCredential(user, credential)
      await updatePassword(user, data.newPassword)
      toast({
        title: "Contraseña Actualizada",
        description: "Tu contraseña ha sido cambiada exitosamente.",
      })
      passwordForm.reset()
    } catch (error) {
      console.error(error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo cambiar la contraseña. Verifica tu contraseña actual.",
      })
    } finally {
      setIsPasswordSaving(false)
    }
  }

  const percentages = settingsForm.watch(["needsPercentage", "wantsPercentage", "savingsPercentage"])
  const totalPercentage = percentages.reduce((acc, val) => acc + (val || 0), 0)

  if (isConfigLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6 space-y-8">
      <div>
        <h1 className="text-2xl font-bold">Configuración</h1>
        <p className="text-muted-foreground">Gestiona la configuración de tu cuenta y presupuesto.</p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
          <CardDescription>Actualiza tu nombre y correo electrónico.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...profileForm}>
            <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-4">
              <FormField
                control={profileForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nombre</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={profileForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Correo Electrónico</FormLabel>
                    <FormControl>
                      <Input type="email" {...field} disabled />
                    </FormControl>
                    <FormDescription>
                      Contacta a soporte para cambiar tu correo electrónico.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isProfileSaving}>
                {isProfileSaving ? <Loader2 className="animate-spin" /> : "Guardar Cambios"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Cambiar Contraseña</CardTitle>
          <CardDescription>Actualiza tu contraseña. Asegúrate de que sea segura.</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...passwordForm}>
            <form onSubmit={passwordForm.handleSubmit(onPasswordSubmit)} className="space-y-4">
              <FormField
                control={passwordForm.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contraseña Actual</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={passwordForm.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nueva Contraseña</FormLabel>
                    <FormControl>
                      <Input type="password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <Button type="submit" disabled={isPasswordSaving}>
                {isPasswordSaving ? <Loader2 className="animate-spin" /> : "Cambiar Contraseña"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Presupuesto 50/30/20</CardTitle>
          <CardDescription>
            Personaliza los porcentajes para tus necesidades, deseos y ahorros.
            Asegúrate de que la suma sea 100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...settingsForm}>
            <form onSubmit={settingsForm.handleSubmit(onBudgetSubmit)} className="space-y-8">
              <FormField
                control={settingsForm.control}
                name="needsPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Necesidades: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={settingsForm.control}
                name="wantsPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Deseos: {field.value}%</FormLabel>
                    <FormControl>
                      <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <FormField
                control={settingsForm.control}
                name="savingsPercentage"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ahorros: {field.value}%</FormLabel>
                    <FormControl>
                       <Slider
                        min={0}
                        max={100}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              <div>
                <p className={`text-sm ${totalPercentage !== 100 ? 'text-destructive' : 'text-muted-foreground'}`}>
                  Total: {totalPercentage}%
                </p>
                 {settingsForm.formState.errors.needsPercentage && (
                  <p className="text-sm font-medium text-destructive">
                    {settingsForm.formState.errors.needsPercentage.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={totalPercentage !== 100}>Guardar Porcentajes</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { useEffect } from "react"
import { useUser, useFirestore, useCollection, useDoc, useMemoFirebase } from "@/firebase"
import { doc, setDoc, getDocs, collection, query, where, writeBatch } from "firebase/firestore"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Loader2 } from "lucide-react"

const settingsSchema = z.object({
  needsPercentage: z.number().min(0).max(100),
  wantsPercentage: z.number().min(0).max(100),
  savingsPercentage: z.number().min(0).max(100),
}).refine(data => data.needsPercentage + data.wantsPercentage + data.savingsPercentage === 100, {
  message: "Los porcentajes deben sumar 100.",
  path: ["needsPercentage"],
})

type SettingsFormValues = z.infer<typeof settingsSchema>

export default function SettingsPage() {
  const { user } = useUser()
  const firestore = useFirestore()
  const { toast } = useToast()

  const configQuery = useMemoFirebase(() => 
    user ? query(collection(firestore, "users", user.uid, "configuration"), where("userId", "==", user.uid)) : null
  , [firestore, user])

  const { data: configData, isLoading: isConfigLoading } = useCollection(configQuery)
  const config = configData?.[0]

  const form = useForm<SettingsFormValues>({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      needsPercentage: 50,
      wantsPercentage: 30,
      savingsPercentage: 20,
    },
  })

  useEffect(() => {
    if (config) {
      form.reset({
        needsPercentage: config.needsPercentage,
        wantsPercentage: config.wantsPercentage,
        savingsPercentage: config.savingsPercentage,
      })
    }
  }, [config, form])

  const onSubmit = async (data: SettingsFormValues) => {
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
        description: "No se pudo guardar la configuración.",
      })
    }
  }

  const percentages = form.watch(["needsPercentage", "wantsPercentage", "savingsPercentage"])
  const totalPercentage = percentages.reduce((acc, val) => acc + (val || 0), 0)

  if (isConfigLoading) {
    return (
      <div className="flex h-full items-center justify-center p-6">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="p-4 lg:p-6">
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>
      <Card>
        <CardHeader>
          <CardTitle>Presupuesto 50/30/20</CardTitle>
          <CardDescription>
            Personaliza los porcentajes para tus necesidades, deseos y ahorros.
            Asegúrate de que la suma sea 100%.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
              <FormField
                control={form.control}
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
                control={form.control}
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
                control={form.control}
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
                 {form.formState.errors.needsPercentage && (
                  <p className="text-sm font-medium text-destructive">
                    {form.formState.errors.needsPercentage.message}
                  </p>
                )}
              </div>
              <Button type="submit" disabled={totalPercentage !== 100}>Guardar Cambios</Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  )
}

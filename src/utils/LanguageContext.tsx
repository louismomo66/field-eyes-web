import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

// Define available languages
export type Language = 'en' | 'fr' | 'es' | 'pt';

interface LanguageContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

interface LanguageProviderProps {
  children: ReactNode;
}

// Simple translations object - in a real app, this would be more comprehensive
const translations: Record<Language, Record<string, string>> = {
  en: {
    // Common
    'home': 'Home',
    'dashboard': 'Dashboard',
    'analytics': 'Analytics',
    'map': 'Map',
    'settings': 'Settings',
    'logout': 'Logout',
    'user': 'User',
    'save': 'Save',
    'cancel': 'Cancel',
    'profile': 'Profile',
    'security': 'Security',
    'notifications': 'Notifications',
    'language': 'Language',
    'profile_settings': 'Profile Settings',
    'password_security': 'Password & Security',
    'notification_preferences': 'Notification Preferences',
    'full_name': 'Full Name',
    'email_address': 'Email Address',
    'phone_number': 'Phone Number',
    'bio': 'Bio',
    'current_password': 'Current Password',
    'new_password': 'New Password',
    'confirm_password': 'Confirm New Password',
    'save_changes': 'Save Changes',
    'update_password': 'Update Password',
    'save_preferences': 'Save Preferences',
    'email_notifications': 'Email Notifications',
    'push_notifications': 'Push Notifications',
    'sms_notifications': 'SMS Notifications',
    'email_for_notifications': 'Email address for notifications',
    'phone_for_notifications': 'Phone number for SMS notifications',
    'device_alerts': 'Device Alerts (offline, battery low, etc.)',
    'weekly_reports': 'Weekly Summary Reports',
    'marketing_updates': 'Product Updates & Marketing',
    'language_settings': 'Language Settings',
    'select_language': 'Select Language',
    'english': 'English',
    'french': 'French',
    'spanish': 'Spanish',
    'portuguese': 'Portuguese',
    'profile_updated': 'Profile updated successfully',
    'password_updated': 'Password updated successfully',
    'notification_settings_saved': 'Notification settings saved successfully',
    'language_settings_saved': 'Language settings saved successfully',
    'passwords_dont_match': 'New passwords do not match',
  },
  fr: {
    // French translations
    'home': 'Accueil',
    'dashboard': 'Tableau de bord',
    'analytics': 'Analyses',
    'map': 'Carte',
    'settings': 'Paramètres',
    'logout': 'Déconnexion',
    'user': 'Utilisateur',
    'save': 'Enregistrer',
    'cancel': 'Annuler',
    'profile': 'Profil',
    'security': 'Sécurité',
    'notifications': 'Notifications',
    'language': 'Langue',
    'profile_settings': 'Paramètres du profil',
    'password_security': 'Mot de passe et sécurité',
    'notification_preferences': 'Préférences de notification',
    'full_name': 'Nom complet',
    'email_address': 'Adresse e-mail',
    'phone_number': 'Numéro de téléphone',
    'bio': 'Biographie',
    'current_password': 'Mot de passe actuel',
    'new_password': 'Nouveau mot de passe',
    'confirm_password': 'Confirmer le nouveau mot de passe',
    'save_changes': 'Enregistrer les modifications',
    'update_password': 'Mettre à jour le mot de passe',
    'save_preferences': 'Enregistrer les préférences',
    'email_notifications': 'Notifications par e-mail',
    'push_notifications': 'Notifications push',
    'sms_notifications': 'Notifications SMS',
    'email_for_notifications': 'Adresse e-mail pour les notifications',
    'phone_for_notifications': 'Numéro de téléphone pour les notifications SMS',
    'device_alerts': 'Alertes de périphérique (hors ligne, batterie faible, etc.)',
    'weekly_reports': 'Rapports hebdomadaires',
    'marketing_updates': 'Mises à jour de produits et marketing',
    'language_settings': 'Paramètres de langue',
    'select_language': 'Sélectionner la langue',
    'english': 'Anglais',
    'french': 'Français',
    'spanish': 'Espagnol',
    'portuguese': 'Portugais',
    'profile_updated': 'Profil mis à jour avec succès',
    'password_updated': 'Mot de passe mis à jour avec succès',
    'notification_settings_saved': 'Paramètres de notification enregistrés avec succès',
    'language_settings_saved': 'Paramètres de langue enregistrés avec succès',
    'passwords_dont_match': 'Les nouveaux mots de passe ne correspondent pas',
  },
  es: {
    // Spanish translations
    'home': 'Inicio',
    'dashboard': 'Panel de control',
    'analytics': 'Análisis',
    'map': 'Mapa',
    'settings': 'Configuración',
    'logout': 'Cerrar sesión',
    'user': 'Usuario',
    'save': 'Guardar',
    'cancel': 'Cancelar',
    'profile': 'Perfil',
    'security': 'Seguridad',
    'notifications': 'Notificaciones',
    'language': 'Idioma',
    'profile_settings': 'Configuración de perfil',
    'password_security': 'Contraseña y seguridad',
    'notification_preferences': 'Preferencias de notificación',
    'full_name': 'Nombre completo',
    'email_address': 'Correo electrónico',
    'phone_number': 'Número de teléfono',
    'bio': 'Biografía',
    'current_password': 'Contraseña actual',
    'new_password': 'Nueva contraseña',
    'confirm_password': 'Confirmar nueva contraseña',
    'save_changes': 'Guardar cambios',
    'update_password': 'Actualizar contraseña',
    'save_preferences': 'Guardar preferencias',
    'email_notifications': 'Notificaciones por correo',
    'push_notifications': 'Notificaciones push',
    'sms_notifications': 'Notificaciones SMS',
    'email_for_notifications': 'Correo electrónico para notificaciones',
    'phone_for_notifications': 'Número de teléfono para notificaciones SMS',
    'device_alerts': 'Alertas de dispositivo (sin conexión, batería baja, etc.)',
    'weekly_reports': 'Informes semanales',
    'marketing_updates': 'Actualizaciones de productos y marketing',
    'language_settings': 'Configuración de idioma',
    'select_language': 'Seleccionar idioma',
    'english': 'Inglés',
    'french': 'Francés',
    'spanish': 'Español',
    'portuguese': 'Portugués',
    'profile_updated': 'Perfil actualizado con éxito',
    'password_updated': 'Contraseña actualizada con éxito',
    'notification_settings_saved': 'Configuración de notificaciones guardada con éxito',
    'language_settings_saved': 'Configuración de idioma guardada con éxito',
    'passwords_dont_match': 'Las nuevas contraseñas no coinciden',
  },
  pt: {
    // Portuguese translations
    'home': 'Início',
    'dashboard': 'Painel de controle',
    'analytics': 'Análises',
    'map': 'Mapa',
    'settings': 'Configurações',
    'logout': 'Sair',
    'user': 'Usuário',
    'save': 'Salvar',
    'cancel': 'Cancelar',
    'profile': 'Perfil',
    'security': 'Segurança',
    'notifications': 'Notificações',
    'language': 'Idioma',
    'profile_settings': 'Configurações de perfil',
    'password_security': 'Senha e segurança',
    'notification_preferences': 'Preferências de notificação',
    'full_name': 'Nome completo',
    'email_address': 'Endereço de e-mail',
    'phone_number': 'Número de telefone',
    'bio': 'Biografia',
    'current_password': 'Senha atual',
    'new_password': 'Nova senha',
    'confirm_password': 'Confirmar nova senha',
    'save_changes': 'Salvar alterações',
    'update_password': 'Atualizar senha',
    'save_preferences': 'Salvar preferências',
    'email_notifications': 'Notificações por e-mail',
    'push_notifications': 'Notificações push',
    'sms_notifications': 'Notificações SMS',
    'email_for_notifications': 'Endereço de e-mail para notificações',
    'phone_for_notifications': 'Número de telefone para notificações SMS',
    'device_alerts': 'Alertas de dispositivo (offline, bateria baixa, etc.)',
    'weekly_reports': 'Relatórios semanais',
    'marketing_updates': 'Atualizações de produtos e marketing',
    'language_settings': 'Configurações de idioma',
    'select_language': 'Selecionar idioma',
    'english': 'Inglês',
    'french': 'Francês',
    'spanish': 'Espanhol',
    'portuguese': 'Português',
    'profile_updated': 'Perfil atualizado com sucesso',
    'password_updated': 'Senha atualizada com sucesso',
    'notification_settings_saved': 'Configurações de notificação salvas com sucesso',
    'language_settings_saved': 'Configurações de idioma salvas com sucesso',
    'passwords_dont_match': 'As novas senhas não coincidem',
  }
};

export const LanguageProvider: React.FC<LanguageProviderProps> = ({ children }) => {
  // Get language from localStorage or default to English
  const [language, setLanguageState] = useState<Language>(() => {
    const savedLanguage = localStorage.getItem('language') as Language;
    return savedLanguage || 'en';
  });

  // Update language in localStorage when it changes
  useEffect(() => {
    localStorage.setItem('language', language);
  }, [language]);

  // Function to set language
  const setLanguage = (newLanguage: Language) => {
    setLanguageState(newLanguage);
  };

  // Translation function
  const t = (key: string): string => {
    return translations[language][key] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}; 
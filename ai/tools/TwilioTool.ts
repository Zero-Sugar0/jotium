import { FunctionDeclaration, Type } from "@google/genai";

export class TwilioTool {
  private twilio: any;
  private accountSid: string;
  private authToken: string;

  constructor(accountSid: string, authToken: string) {
    this.accountSid = accountSid;
    this.authToken = authToken;
    // Use proper import instead of require
    const twilio = require('twilio');
    this.twilio = twilio(accountSid, authToken);
  }

  // SMS Messaging functionality
  getSMSDefinition(): FunctionDeclaration {
    return {
      name: "send_sms",
      description: "Send SMS text messages to any phone number worldwide. Perfect for notifications, alerts, marketing campaigns, or two-way communication. Supports plain text messages up to 1600 characters, multimedia messages (MMS) with images/audio/video, delivery tracking, and scheduled sending. Use this for customer notifications, appointment reminders, authentication codes, or bulk marketing campaigns.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          to: {
            type: Type.STRING,
            description: "The recipient's phone number in E.164 format (e.g., +1234567890)"
          },
          from: {
            type: Type.STRING,
            description: "Your Twilio phone number in E.164 format (e.g., +1234567890)"
          },
          body: {
            type: Type.STRING,
            description: "The text message content (up to 1600 characters)"
          },
          mediaUrl: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Array of media URLs to send as MMS (images, audio, video). Up to 10 media files."
          },
          statusCallback: {
            type: Type.STRING,
            description: "Webhook URL to receive delivery status updates"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callback (GET or POST)",
            enum: ["GET", "POST"]
          },
          messagingServiceSid: {
            type: Type.STRING,
            description: "Messaging Service SID for sending via a messaging service"
          },
          maxPrice: {
            type: Type.STRING,
            description: "Maximum price in your account's currency to pay for the message"
          },
          provideFeedback: {
            type: Type.BOOLEAN,
            description: "Whether to confirm delivery of the message"
          },
          attemptPartialDelivery: {
            type: Type.BOOLEAN,
            description: "Whether to attempt partial delivery if message exceeds carrier limits"
          },
          validityPeriod: {
            type: Type.NUMBER,
            description: "How long in seconds to attempt delivery (1-14400 seconds)"
          },
          forceDelivery: {
            type: Type.BOOLEAN,
            description: "Force delivery over cellular when WiFi-to-SMS gateway is available"
          },
          smartEncoded: {
            type: Type.BOOLEAN,
            description: "Whether to use smart encoding for special characters"
          },
          persistentAction: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Rich actions that persist after the message is delivered"
          }
        },
        required: ["to", "body", "from"]
      }
    };
  }

  // WhatsApp Business Platform functionality
  getWhatsAppDefinition(): FunctionDeclaration {
    return {
      name: "send_whatsapp",
      description: "Send WhatsApp Business messages to customers worldwide. Ideal for customer support, order updates, appointment reminders, and marketing campaigns. Supports text messages, images, documents, audio/video files, and pre-approved message templates. Use this for high-engagement customer communication with rich media support and automated responses.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          to: {
            type: Type.STRING,
            description: "Recipient's WhatsApp number in format: whatsapp:+1234567890"
          },
          from: {
            type: Type.STRING,
            description: "Your WhatsApp Business number in format: whatsapp:+1234567890"
          },
          body: {
            type: Type.STRING,
            description: "Message text content for freeform messages (within 24h conversation window)"
          },
          mediaUrl: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Media URLs for images (JPG/PNG), audio, PDF files (max 16MB per message)"
          },
          contentSid: {
            type: Type.STRING,
            description: "Content Template SID for approved WhatsApp message templates"
          },
          contentVariables: {
            type: Type.OBJECT,
            description: "Variables for message template substitution as JSON object"
          },
          statusCallback: {
            type: Type.STRING,
            description: "Webhook URL for delivery status updates"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callback",
            enum: ["GET", "POST"]
          },
          maxPrice: {
            type: Type.STRING,
            description: "Maximum price to pay for the message"
          },
          provideFeedback: {
            type: Type.BOOLEAN,
            description: "Whether to confirm delivery of the message"
          },
          persistentAction: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Rich actions that persist after message delivery"
          }
        },
        required: ["to", "from"]
      }
    };
  }

  // Voice Calls functionality
  getVoiceCallDefinition(): FunctionDeclaration {
    return {
      name: "make_voice_call",
      description: "Make automated voice calls to any phone number with interactive voice response (IVR), call recording, text-to-speech, and real-time call control. Perfect for appointment reminders, customer service hotlines, emergency notifications, or automated surveys. Create dynamic call flows with TwiML instructions, handle voicemail detection, and record conversations for quality assurance.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          to: {
            type: Type.STRING,
            description: "Phone number to call in E.164 format (e.g., +1234567890)"
          },
          from: {
            type: Type.STRING,
            description: "Your Twilio phone number in E.164 format"
          },
          url: {
            type: Type.STRING,
            description: "TwiML URL that returns instructions for the call"
          },
          twiml: {
            type: Type.STRING,
            description: "TwiML instructions as a string (alternative to URL)"
          },
          applicationSid: {
            type: Type.STRING,
            description: "Application SID with voice URLs configured"
          },
          method: {
            type: Type.STRING,
            description: "HTTP method for the URL request",
            enum: ["GET", "POST"]
          },
          fallbackUrl: {
            type: Type.STRING,
            description: "Fallback URL if the primary URL fails"
          },
          fallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for fallback URL",
            enum: ["GET", "POST"]
          },
          statusCallback: {
            type: Type.STRING,
            description: "Webhook URL for call status updates"
          },
          statusCallbackEvent: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Events that trigger status callbacks"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callbacks",
            enum: ["GET", "POST"]
          },
          sendDigits: {
            type: Type.STRING,
            description: "DTMF tones to send when call connects"
          },
          timeout: {
            type: Type.NUMBER,
            description: "Time in seconds to wait for an answer (5-600)"
          },
          record: {
            type: Type.BOOLEAN,
            description: "Whether to record the call"
          },
          recordingChannels: {
            type: Type.STRING,
            description: "Number of channels for recording (mono or dual)",
            enum: ["mono", "dual"]
          },
          recordingStatusCallback: {
            type: Type.STRING,
            description: "Webhook URL for recording status updates"
          },
          recordingStatusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for recording status callback",
            enum: ["GET", "POST"]
          },
          sipAuthUsername: {
            type: Type.STRING,
            description: "Username for SIP authentication"
          },
          sipAuthPassword: {
            type: Type.STRING,
            description: "Password for SIP authentication"
          },
          machineDetection: {
            type: Type.STRING,
            description: "Answering machine detection",
            enum: ["Enable", "DetectMessageEnd"]
          },
          machineDetectionTimeout: {
            type: Type.NUMBER,
            description: "Time to wait for machine detection (3-60 seconds)"
          },
          asyncAmd: {
            type: Type.STRING,
            description: "Async answering machine detection",
            enum: ["true", "false"]
          },
          asyncAmdStatusCallback: {
            type: Type.STRING,
            description: "Webhook URL for async AMD results"
          },
          asyncAmdStatusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for async AMD callback",
            enum: ["GET", "POST"]
          },
          callerId: {
            type: Type.STRING,
            description: "Caller ID to display (must be verified or Twilio number)"
          },
          callReason: {
            type: Type.STRING,
            description: "Reason for the call for compliance"
          },
          callToken: {
            type: Type.STRING,
            description: "Token for call authentication"
          }
        },
        required: ["to", "from"]
      }
    };
  }

  // Video Calls/Rooms functionality
  getVideoDefinition(): FunctionDeclaration {
    return {
      name: "create_video_room",
      description: "Create secure, scalable video conferencing rooms for virtual meetings, webinars, telemedicine, online education, and remote collaboration. Supports up to 50 participants with HD video, screen sharing, recording, and real-time chat. Perfect for business meetings, virtual classrooms, healthcare consultations, or social gatherings with enterprise-grade security and global infrastructure.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          uniqueName: {
            type: Type.STRING,
            description: "Unique identifier for the video room"
          },
          type: {
            type: Type.STRING,
            description: "Room type determining behavior and pricing",
            enum: ["go", "peer-to-peer", "small-group", "group"]
          },
          statusCallback: {
            type: Type.STRING,
            description: "Webhook URL for room status events"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callbacks",
            enum: ["GET", "POST"]
          },
          maxParticipants: {
            type: Type.NUMBER,
            description: "Maximum number of participants (1-50)"
          },
          recordParticipantsOnConnect: {
            type: Type.BOOLEAN,
            description: "Whether to automatically start recording when participants join"
          },
          videoCodecs: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Preferred video codecs"
          },
          mediaRegion: {
            type: Type.STRING,
            description: "Media processing region for reduced latency",
            enum: ["us1", "us2", "ie1", "au1", "sg1", "jp1", "gll"]
          },
          enableTurn: {
            type: Type.BOOLEAN,
            description: "Whether to enable TURN servers for NAT traversal"
          },
          endRoomWhenEmpty: {
            type: Type.BOOLEAN,
            description: "Whether to end room when last participant leaves"
          },
          emptyRoomTimeout: {
            type: Type.NUMBER,
            description: "Time in minutes to keep empty room alive (1-60)"
          },
          unusedRoomTimeout: {
            type: Type.NUMBER,
            description: "Time in minutes before closing unused room (1-60)"
          }
        }
      }
    };
  }

  // Phone Number Management
  getPhoneNumberDefinition(): FunctionDeclaration {
    return {
      name: "manage_phone_numbers",
      description: "Search, purchase, and configure local, toll-free, and international phone numbers from 100+ countries. Find numbers by area code, city, or capabilities (SMS, voice, MMS, fax). Set up call forwarding, SMS handling, webhooks, and emergency services. Perfect for businesses needing dedicated numbers for customer service, marketing campaigns, or global operations.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform with phone numbers",
            enum: ["search", "purchase", "list", "update", "release"]
          },
          phoneNumber: {
            type: Type.STRING,
            description: "Specific phone number for purchase/update/release actions"
          },
          areaCode: {
            type: Type.STRING,
            description: "Area code for number search (3 digits)"
          },
          countryCode: {
            type: Type.STRING,
            description: "ISO country code for international numbers (e.g., US, GB, CA)"
          },
          contains: {
            type: Type.STRING,
            description: "Pattern that must be contained in the number"
          },
          smsEnabled: {
            type: Type.BOOLEAN,
            description: "Whether number should support SMS"
          },
          mmsEnabled: {
            type: Type.BOOLEAN,
            description: "Whether number should support MMS"
          },
          voiceEnabled: {
            type: Type.BOOLEAN,
            description: "Whether number should support voice calls"
          },
          excludeAllAddressRequired: {
            type: Type.BOOLEAN,
            description: "Exclude numbers that require address validation"
          },
          excludeForeignAddressRequired: {
            type: Type.BOOLEAN,
            description: "Exclude numbers requiring foreign address"
          },
          beta: {
            type: Type.BOOLEAN,
            description: "Include beta/preview numbers in search"
          },
          nearNumber: {
            type: Type.STRING,
            description: "Find numbers near this phone number"
          },
          nearLatLong: {
            type: Type.STRING,
            description: "Find numbers near this latitude,longitude"
          },
          distance: {
            type: Type.NUMBER,
            description: "Search radius in miles from nearNumber/nearLatLong"
          },
          inPostalCode: {
            type: Type.STRING,
            description: "Find numbers in specific postal code"
          },
          inRegion: {
            type: Type.STRING,
            description: "Find numbers in specific region/state"
          },
          inRateCenter: {
            type: Type.STRING,
            description: "Find numbers in specific rate center"
          },
          inLata: {
            type: Type.STRING,
            description: "Find numbers in specific LATA"
          },
          inLocality: {
            type: Type.STRING,
            description: "Find numbers in specific city/locality"
          },
          faxEnabled: {
            type: Type.BOOLEAN,
            description: "Whether number should support fax"
          },
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return (1-1000)"
          },
          // For update/configuration actions
          friendlyName: {
            type: Type.STRING,
            description: "Friendly name for the phone number"
          },
          voiceUrl: {
            type: Type.STRING,
            description: "URL for voice call webhooks"
          },
          voiceMethod: {
            type: Type.STRING,
            description: "HTTP method for voice URL",
            enum: ["GET", "POST"]
          },
          voiceFallbackUrl: {
            type: Type.STRING,
            description: "Fallback URL for voice calls"
          },
          voiceFallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for voice fallback URL",
            enum: ["GET", "POST"]
          },
          smsUrl: {
            type: Type.STRING,
            description: "URL for SMS webhooks"
          },
          smsMethod: {
            type: Type.STRING,
            description: "HTTP method for SMS URL",
            enum: ["GET", "POST"]
          },
          smsFallbackUrl: {
            type: Type.STRING,
            description: "Fallback URL for SMS"
          },
          smsFallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for SMS fallback URL",
            enum: ["GET", "POST"]
          },
          statusCallback: {
            type: Type.STRING,
            description: "Status callback URL"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callback",
            enum: ["GET", "POST"]
          },
          voiceCallerIdLookup: {
            type: Type.BOOLEAN,
            description: "Whether to perform caller ID lookup on voice calls"
          },
          voiceReceiveMode: {
            type: Type.STRING,
            description: "How to receive voice calls",
            enum: ["voice", "fax"]
          },
          identitySid: {
            type: Type.STRING,
            description: "Identity SID for number ownership verification"
          },
          addressSid: {
            type: Type.STRING,
            description: "Address SID for emergency services"
          },
          emergencyStatus: {
            type: Type.STRING,
            description: "Emergency calling status",
            enum: ["Active", "Inactive"]
          },
          emergencyAddressSid: {
            type: Type.STRING,
            description: "Address SID for emergency services"
          },
          trunkSid: {
            type: Type.STRING,
            description: "SIP Trunk SID for routing voice calls"
          },
          voiceApplicationSid: {
            type: Type.STRING,
            description: "Application SID for voice calls"
          },
          smsApplicationSid: {
            type: Type.STRING,
            description: "Application SID for SMS"
          }
        },
        required: ["action"]
      }
    };
  }

  // Conversation/Chat API
  getConversationDefinition(): FunctionDeclaration {
    return {
      name: "manage_conversations",
      description: "Create unified, multi-channel conversation threads that seamlessly connect customers across SMS, WhatsApp, web chat, and mobile apps. Perfect for customer support teams, sales conversations, or community building where users can switch between messaging platforms while maintaining conversation history. Supports group conversations, role-based permissions, typing indicators, read receipts, and rich media sharing.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Action to perform with conversations",
            enum: ["create", "list", "get", "update", "delete", "add_participant", "remove_participant", "send_message"]
          },
          conversationSid: {
            type: Type.STRING,
            description: "Unique identifier for existing conversation (required for most actions)"
          },
          friendlyName: {
            type: Type.STRING,
            description: "Human-readable name for the conversation"
          },
          uniqueName: {
            type: Type.STRING,
            description: "Unique name identifier for the conversation"
          },
          attributes: {
            type: Type.STRING,
            description: "JSON string of custom attributes for the conversation"
          },
          messagingServiceSid: {
            type: Type.STRING,
            description: "Messaging Service SID for SMS participants"
          },
          state: {
            type: Type.STRING,
            description: "Conversation state",
            enum: ["inactive", "active", "closed"]
          },
          timers: {
            type: Type.OBJECT,
            description: "Timer configuration object for conversation lifecycle"
          },
          bindings: {
            type: Type.OBJECT,
            description: "Channel bindings configuration"
          },
          // For participants
          participantIdentity: {
            type: Type.STRING,
            description: "Identity of participant to add/remove"
          },
          participantAddress: {
            type: Type.STRING,
            description: "Phone number or address for SMS/WhatsApp participants"
          },
          participantProxyAddress: {
            type: Type.STRING,
            description: "Twilio phone number for SMS/WhatsApp binding"
          },
          participantBinding: {
            type: Type.OBJECT,
            description: "Binding configuration for participant"
          },
          participantAttributes: {
            type: Type.STRING,
            description: "JSON string of participant attributes"
          },
          participantRoleSid: {
            type: Type.STRING,
            description: "Role SID for participant permissions"
          },
          // For messages
          messageBody: {
            type: Type.STRING,
            description: "Message content text"
          },
          messageAuthor: {
            type: Type.STRING,
            description: "Message author identity"
          },
          messageMediaSid: {
            type: Type.STRING,
            description: "Media SID for message attachments"
          },
          messageAttributes: {
            type: Type.STRING,
            description: "JSON string of message attributes"
          },
          messageContentSid: {
            type: Type.STRING,
            description: "Content template SID for rich messages"
          },
          messageContentVariables: {
            type: Type.STRING,
            description: "JSON string of content template variables"
          },
          // List/query parameters
          limit: {
            type: Type.NUMBER,
            description: "Maximum number of results to return"
          },
          pageSize: {
            type: Type.NUMBER,
            description: "Number of results per page"
          }
        },
        required: ["action"]
      }
    };
  }

  // Fax functionality
  getFaxDefinition(): FunctionDeclaration {
    return {
      name: "send_fax",
      description: "Send and receive faxes digitally without traditional fax machines. Perfect for healthcare, legal, financial, and government sectors that still require fax communication. Supports PDF, TIFF, JPEG, GIF, and PNG documents with multiple quality settings, delivery confirmation, and automatic retry. Send faxes to any fax number worldwide with detailed status tracking and webhooks for delivery notifications.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          to: {
            type: Type.STRING,
            description: "Recipient fax number in E.164 format"
          },
          from: {
            type: Type.STRING,
            description: "Your Twilio fax-enabled number in E.164 format"
          },
          mediaUrl: {
            type: Type.STRING,
            description: "URL of document to fax (PDF, TIFF, JPEG, GIF, PNG)"
          },
          quality: {
            type: Type.STRING,
            description: "Fax quality setting",
            enum: ["standard", "fine", "superfine"]
          },
          statusCallback: {
            type: Type.STRING,
            description: "Webhook URL for fax status updates"
          },
          statusCallbackMethod: {
            type: Type.STRING,
            description: "HTTP method for status callbacks",
            enum: ["GET", "POST"]
          },
          storeMedia: {
            type: Type.BOOLEAN,
            description: "Whether to store received fax media (for inbound faxes)"
          },
          ttl: {
            type: Type.NUMBER,
            description: "Time to live in minutes for fax attempt (1-1440)"
          },
          sipAuthUsername: {
            type: Type.STRING,
            description: "SIP authentication username"
          },
          sipAuthPassword: {
            type: Type.STRING,
            description: "SIP authentication password"
          }
        },
        required: ["to", "from", "mediaUrl"]
      }
    };
  }

  // Lookup API for phone validation
  getLookupDefinition(): FunctionDeclaration {
    return {
      name: "phone_lookup",
      description: "Validate phone numbers, detect carrier information, identify line type (mobile/landline/VoIP), and prevent fraud before it happens. Get detailed insights including location, timezone, porting history, and spam risk scoring. Perfect for form validation, lead quality assessment, fraud prevention, and ensuring message deliverability. Supports international numbers from 100+ countries with real-time carrier database updates.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          phoneNumber: {
            type: Type.STRING,
            description: "Phone number to lookup in any format"
          },
          countryCode: {
            type: Type.STRING,
            description: "ISO country code for number parsing (e.g., US, GB)"
          },
          type: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Types of information to retrieve"
          },
          addOns: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Marketplace add-ons to execute"
          },
          addOnsData: {
            type: Type.OBJECT,
            description: "Parameters for marketplace add-ons"
          },
          fields: {
            type: Type.STRING,
            description: "Additional fields to include in response"
          },
          // For identity match
          firstName: {
            type: Type.STRING,
            description: "First name for identity matching"
          },
          lastName: {
            type: Type.STRING,
            description: "Last name for identity matching"
          },
          addressLine1: {
            type: Type.STRING,
            description: "Address line 1 for identity matching"
          },
          city: {
            type: Type.STRING,
            description: "City for identity matching"
          },
          state: {
            type: Type.STRING,
            description: "State for identity matching"
          },
          postalCode: {
            type: Type.STRING,
            description: "Postal code for identity matching"
          },
          addressCountryCode: {
            type: Type.STRING,
            description: "Country code for address"
          },
          nationalId: {
            type: Type.STRING,
            description: "National ID for identity matching"
          },
          dateOfBirth: {
            type: Type.STRING,
            description: "Date of birth (YYYY-MM-DD) for identity matching"
          }
        },
        required: ["phoneNumber"]
      }
    };
  }

  // Verify API for 2FA
  getVerifyDefinition(): FunctionDeclaration {
    return {
      name: "phone_verification",
      description: "Implement secure two-factor authentication (2FA) and phone verification with customizable verification codes via SMS, voice calls, WhatsApp, email, or push notifications. Perfect for user registration, password resets, transaction authorization, and account security. Features include rate limiting, fraud detection, custom code lengths, multiple language support, and PSD2 compliance for financial services. Built-in protection against SMS pumping and automated attacks.",
      parameters: {
        type: Type.OBJECT,
        properties: {
          action: {
            type: Type.STRING,
            description: "Verification action to perform",
            enum: ["start_verification", "check_verification", "create_service", "update_service", "list_services"]
          },
          serviceSid: {
            type: Type.STRING,
            description: "Verify Service SID (required for verification actions)"
          },
          to: {
            type: Type.STRING,
            description: "Phone number, email, or identity to verify"
          },
          channel: {
            type: Type.STRING,
            description: "Verification channel",
            enum: ["sms", "call", "email", "whatsapp", "push", "totp"]
          },
          code: {
            type: Type.STRING,
            description: "Verification code to check (for check_verification)"
          },
          customFriendlyName: {
            type: Type.STRING,
            description: "Custom service name shown to users"
          },
          customMessage: {
            type: Type.STRING,
            description: "Custom verification message template"
          },
          customCodeLength: {
            type: Type.NUMBER,
            description: "Length of verification code (4-10 digits)"
          },
          locale: {
            type: Type.STRING,
            description: "Language/locale for verification messages"
          },
          customCode: {
            type: Type.STRING,
            description: "Custom verification code to send"
          },
          amount: {
            type: Type.STRING,
            description: "Amount for transaction verification (PSD2)"
          },
          payee: {
            type: Type.STRING,
            description: "Payee for transaction verification (PSD2)"
          },
          rateLimits: {
            type: Type.OBJECT,
            description: "Rate limiting configuration for the service"
          },
          codeLength: {
            type: Type.NUMBER,
            description: "Default verification code length for service"
          },
          lookupEnabled: {
            type: Type.BOOLEAN,
            description: "Whether to use Lookup API for phone validation"
          },
          psd2Enabled: {
            type: Type.BOOLEAN,
            description: "Whether to enable PSD2 compliance features"
          },
          skipSmsToLandlines: {
            type: Type.BOOLEAN,
            description: "Skip SMS to landline numbers"
          },
          dtmfInputRequired: {
            type: Type.BOOLEAN,
            description: "Require DTMF input for voice verification"
          },
          ttsName: {
            type: Type.STRING,
            description: "Text-to-speech voice for voice verification"
          },
          mailerSid: {
            type: Type.STRING,
            description: "SendGrid mailer SID for email verification"
          },
          emailFrom: {
            type: Type.STRING,
            description: "From email address for verification emails"
          },
          emailSubject: {
            type: Type.STRING,
            description: "Subject line for verification emails"
          },
          emailBody: {
            type: Type.STRING,
            description: "HTML body for verification emails"
          },
          appHash: {
            type: Type.STRING,
            description: "App hash for Android SMS retrieval"
          },
          templateSid: {
            type: Type.STRING,
            description: "Message template SID"
          },
          templateCustomSubstitutions: {
            type: Type.STRING,
            description: "JSON string of template variable substitutions"
          },
          deviceIp: {
            type: Type.STRING,
            description: "Device IP address for fraud prevention"
          },
          riskCheck: {
            type: Type.STRING,
            description: "Risk check level",
            enum: ["enable", "disable"]
          },
          tags: {
            type: Type.ARRAY,
            items: { type: Type.STRING },
            description: "Tags for verification tracking"
          }
        },
        required: ["action"]
      }
    };
  }

  // Get all tool definitions
  getAllDefinitions(): FunctionDeclaration[] {
    return [
      this.getSMSDefinition(),
      this.getWhatsAppDefinition(),
      this.getVoiceCallDefinition(),
      this.getVideoDefinition(),
      this.getPhoneNumberDefinition(),
      this.getConversationDefinition(),
      this.getFaxDefinition(),
      this.getLookupDefinition(),
      this.getVerifyDefinition()
    ];
  }

  // SMS execution
  async executeSMS(args: any): Promise<any> {
    try {
      console.log(`📱 Sending SMS to ${args.to}`);
      
      const messageOptions: any = {
        to: args.to,
        body: args.body
      };

      // Add optional parameters
      if (args.from) messageOptions.from = args.from;
      if (args.mediaUrl) messageOptions.mediaUrl = args.mediaUrl;
      if (args.statusCallback) messageOptions.statusCallback = args.statusCallback;
      if (args.statusCallbackMethod) messageOptions.statusCallbackMethod = args.statusCallbackMethod;
      if (args.messagingServiceSid) messageOptions.messagingServiceSid = args.messagingServiceSid;
      if (args.maxPrice) messageOptions.maxPrice = args.maxPrice;
      if (args.provideFeedback !== undefined) messageOptions.provideFeedback = args.provideFeedback;
      if (args.attemptPartialDelivery !== undefined) messageOptions.attemptPartialDelivery = args.attemptPartialDelivery;
      if (args.validityPeriod) messageOptions.validityPeriod = args.validityPeriod;
      if (args.forceDelivery !== undefined) messageOptions.forceDelivery = args.forceDelivery;
      if (args.smartEncoded !== undefined) messageOptions.smartEncoded = args.smartEncoded;
      if (args.persistentAction) messageOptions.persistentAction = args.persistentAction;

      const message = await this.twilio.messages.create(messageOptions);

      return {
        success: true,
        messageSid: message.sid,
        accountSid: message.accountSid,
        to: message.to,
        from: message.from,
        body: message.body,
        status: message.status,
        direction: message.direction,
        apiVersion: message.apiVersion,
        numSegments: message.numSegments,
        numMedia: message.numMedia,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        dateUpdated: message.dateUpdated,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage,
        price: message.price,
        priceUnit: message.priceUnit,
        uri: message.uri,
        subresourceUris: message.subresourceUris
      };

    } catch (error: unknown) {
      console.error("❌ SMS sending failed:", error);
      return {
        success: false,
        error: `SMS sending failed: ${error instanceof Error ? error.message : String(error)}`,
        to: args.to
      };
    }
  }

  // WhatsApp execution
  async executeWhatsApp(args: any): Promise<any> {
    try {
      console.log(`💬 Sending WhatsApp message to ${args.to}`);
      
      const messageOptions: any = {
        to: args.to,
        from: args.from
      };

      // Add message content
      if (args.body) messageOptions.body = args.body;
      if (args.mediaUrl) messageOptions.mediaUrl = args.mediaUrl;
      if (args.contentSid) messageOptions.contentSid = args.contentSid;
      if (args.contentVariables) messageOptions.contentVariables = args.contentVariables;
      
      // Add optional parameters
      if (args.statusCallback) messageOptions.statusCallback = args.statusCallback;
      if (args.statusCallbackMethod) messageOptions.statusCallbackMethod = args.statusCallbackMethod;
      if (args.maxPrice) messageOptions.maxPrice = args.maxPrice;
      if (args.provideFeedback !== undefined) messageOptions.provideFeedback = args.provideFeedback;
      if (args.persistentAction) messageOptions.persistentAction = args.persistentAction;

      const message = await this.twilio.messages.create(messageOptions);

      return {
        success: true,
        messageSid: message.sid,
        accountSid: message.accountSid,
        to: message.to,
        from: message.from,
        body: message.body,
        status: message.status,
        direction: message.direction,
        numSegments: message.numSegments,
        numMedia: message.numMedia,
        dateCreated: message.dateCreated,
        dateSent: message.dateSent,
        price: message.price,
        priceUnit: message.priceUnit,
        messagingServiceSid: message.messagingServiceSid,
        errorCode: message.errorCode,
        errorMessage: message.errorMessage
      };

    } catch (error: unknown) {
      console.error("❌ WhatsApp sending failed:", error);
      return {
        success: false,
        error: `WhatsApp sending failed: ${error instanceof Error ? error.message : String(error)}`,
        to: args.to,
        from: args.from
      };
    }
  }

  // Voice call execution
  async executeVoiceCall(args: any): Promise<any> {
    try {
      console.log(`📞 Making voice call to ${args.to}`);
      
      const callOptions: any = {
        to: args.to,
        from: args.from
      };

      // Add TwiML or URL
      if (args.url) callOptions.url = args.url;
      if (args.twiml) callOptions.twiml = args.twiml;
      if (args.applicationSid) callOptions.applicationSid = args.applicationSid;
      
      // Add optional parameters
      if (args.method) callOptions.method = args.method;
      if (args.fallbackUrl) callOptions.fallbackUrl = args.fallbackUrl;
      if (args.fallbackMethod) callOptions.fallbackMethod = args.fallbackMethod;
      if (args.statusCallback) callOptions.statusCallback = args.statusCallback;
      if (args.statusCallbackEvent) callOptions.statusCallbackEvent = args.statusCallbackEvent;
      if (args.statusCallbackMethod) callOptions.statusCallbackMethod = args.statusCallbackMethod;
      if (args.sendDigits) callOptions.sendDigits = args.sendDigits;
      if (args.timeout) callOptions.timeout = args.timeout;
      if (args.record !== undefined) callOptions.record = args.record;
      if (args.recordingChannels) callOptions.recordingChannels = args.recordingChannels;
      if (args.recordingStatusCallback) callOptions.recordingStatusCallback = args.recordingStatusCallback;
      if (args.recordingStatusCallbackMethod) callOptions.recordingStatusCallbackMethod = args.recordingStatusCallbackMethod;
      if (args.sipAuthUsername) callOptions.sipAuthUsername = args.sipAuthUsername;
      if (args.sipAuthPassword) callOptions.sipAuthPassword = args.sipAuthPassword;
      if (args.machineDetection) callOptions.machineDetection = args.machineDetection;
      if (args.machineDetectionTimeout) callOptions.machineDetectionTimeout = args.machineDetectionTimeout;
      if (args.asyncAmd) callOptions.asyncAmd = args.asyncAmd;
      if (args.asyncAmdStatusCallback) callOptions.asyncAmdStatusCallback = args.asyncAmdStatusCallback;
      if (args.asyncAmdStatusCallbackMethod) callOptions.asyncAmdStatusCallbackMethod = args.asyncAmdStatusCallbackMethod;
      if (args.callerId) callOptions.callerId = args.callerId;
      if (args.callReason) callOptions.callReason = args.callReason;
      if (args.callToken) callOptions.callToken = args.callToken;

      const call = await this.twilio.calls.create(callOptions);

      return {
        success: true,
        callSid: call.sid,
        accountSid: call.accountSid,
        to: call.to,
        from: call.from,
        phoneNumberSid: call.phoneNumberSid,
        status: call.status,
        startTime: call.startTime,
        endTime: call.endTime,
        duration: call.duration,
        price: call.price,
        priceUnit: call.priceUnit,
        direction: call.direction,
        answeredBy: call.answeredBy,
        apiVersion: call.apiVersion,
        forwardedFrom: call.forwardedFrom,
        groupSid: call.groupSid,
        callerName: call.callerName,
        uri: call.uri,
        subresourceUris: call.subresourceUris
      };

    } catch (error: unknown) {
      console.error("❌ Voice call failed:", error);
      return {
        success: false,
        error: `Voice call failed: ${error instanceof Error ? error.message : String(error)}`,
        to: args.to,
        from: args.from
      };
    }
  }

  // Video room execution
  async executeVideo(args: any): Promise<any> {
    try {
      console.log(`🎥 Creating video room: ${args.uniqueName || 'unnamed'}`);
      
      const roomOptions: any = {};

      if (args.uniqueName) roomOptions.uniqueName = args.uniqueName;
      if (args.type) roomOptions.type = args.type;
      if (args.statusCallback) roomOptions.statusCallback = args.statusCallback;
      if (args.statusCallbackMethod) roomOptions.statusCallbackMethod = args.statusCallbackMethod;
      if (args.maxParticipants) roomOptions.maxParticipants = args.maxParticipants;
      if (args.recordParticipantsOnConnect !== undefined) roomOptions.recordParticipantsOnConnect = args.recordParticipantsOnConnect;
      if (args.videoCodecs) roomOptions.videoCodecs = args.videoCodecs;
      if (args.mediaRegion) roomOptions.mediaRegion = args.mediaRegion;
      if (args.enableTurn !== undefined) roomOptions.enableTurn = args.enableTurn;
      if (args.endRoomWhenEmpty !== undefined) roomOptions.endRoomWhenEmpty = args.endRoomWhenEmpty;
      if (args.emptyRoomTimeout) roomOptions.emptyRoomTimeout = args.emptyRoomTimeout;
      if (args.unusedRoomTimeout) roomOptions.unusedRoomTimeout = args.unusedRoomTimeout;

      const room = await this.twilio.video.rooms.create(roomOptions);

      return {
        success: true,
        roomSid: room.sid,
        accountSid: room.accountSid,
        uniqueName: room.uniqueName,
        status: room.status,
        type: room.type,
        maxParticipants: room.maxParticipants,
        duration: room.duration,
        mediaRegion: room.mediaRegion,
        recordParticipantsOnConnect: room.recordParticipantsOnConnect,
        videoCodecs: room.videoCodecs,
        statusCallback: room.statusCallback,
        statusCallbackMethod: room.statusCallbackMethod,
        enableTurn: room.enableTurn,
        endRoomWhenEmpty: room.endRoomWhenEmpty,
        dateCreated: room.dateCreated,
        dateUpdated: room.dateUpdated,
        url: room.url,
        links: room.links
      };

    } catch (error: unknown) {
      console.error("❌ Video room creation failed:", error);
      return {
        success: false,
        error: `Video room creation failed: ${error instanceof Error ? error.message : String(error)}`,
        uniqueName: args.uniqueName
      };
    }
  }

  // Phone number management execution
  async executePhoneNumber(args: any): Promise<any> {
    try {
      console.log(`📞 Phone number action: ${args.action}`);
      
      switch (args.action) {
        case 'search':
          return await this.searchPhoneNumbers(args);
        case 'purchase':
          return await this.purchasePhoneNumber(args);
        case 'list':
          return await this.listPhoneNumbers(args);
        case 'update':
          return await this.updatePhoneNumber(args);
        case 'release':
          return await this.releasePhoneNumber(args);
        default:
          throw new Error(`Unknown phone number action: ${args.action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Phone number operation failed:", error);
      return {
        success: false,
        error: `Phone number operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async searchPhoneNumbers(args: any): Promise<any> {
    const searchOptions: any = {};
    
    if (args.areaCode) searchOptions.areaCode = args.areaCode;
    if (args.contains) searchOptions.contains = args.contains;
    if (args.smsEnabled !== undefined) searchOptions.smsEnabled = args.smsEnabled;
    if (args.mmsEnabled !== undefined) searchOptions.mmsEnabled = args.mmsEnabled;
    if (args.voiceEnabled !== undefined) searchOptions.voiceEnabled = args.voiceEnabled;
    if (args.excludeAllAddressRequired !== undefined) searchOptions.excludeAllAddressRequired = args.excludeAllAddressRequired;
    if (args.excludeForeignAddressRequired !== undefined) searchOptions.excludeForeignAddressRequired = args.excludeForeignAddressRequired;
    if (args.beta !== undefined) searchOptions.beta = args.beta;
    if (args.nearNumber) searchOptions.nearNumber = args.nearNumber;
    if (args.nearLatLong) searchOptions.nearLatLong = args.nearLatLong;
    if (args.distance) searchOptions.distance = args.distance;
    if (args.inPostalCode) searchOptions.inPostalCode = args.inPostalCode;
    if (args.inRegion) searchOptions.inRegion = args.inRegion;
    if (args.inRateCenter) searchOptions.inRateCenter = args.inRateCenter;
    if (args.inLata) searchOptions.inLata = args.inLata;
    if (args.inLocality) searchOptions.inLocality = args.inLocality;
    if (args.faxEnabled !== undefined) searchOptions.faxEnabled = args.faxEnabled;
    if (args.limit) searchOptions.limit = args.limit;

    const countryCode = args.countryCode || 'US';
    const availableNumbers = await this.twilio.availablePhoneNumbers(countryCode).local.list(searchOptions);

    return {
      success: true,
      action: 'search',
      countryCode,
      searchCriteria: searchOptions,
      numbers: availableNumbers.map((num: any) => ({
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        locality: num.locality,
        region: num.region,
        postalCode: num.postalCode,
        isoCountry: num.isoCountry,
        capabilities: num.capabilities,
        beta: num.beta,
        addressRequirements: num.addressRequirements
      })),
      totalFound: availableNumbers.length
    };
  }

  private async purchasePhoneNumber(args: any): Promise<any> {
    const purchaseOptions: any = {
      phoneNumber: args.phoneNumber
    };

    // Add optional configuration
    if (args.friendlyName) purchaseOptions.friendlyName = args.friendlyName;
    if (args.voiceUrl) purchaseOptions.voiceUrl = args.voiceUrl;
    if (args.voiceMethod) purchaseOptions.voiceMethod = args.voiceMethod;
    if (args.voiceFallbackUrl) purchaseOptions.voiceFallbackUrl = args.voiceFallbackUrl;
    if (args.voiceFallbackMethod) purchaseOptions.voiceFallbackMethod = args.voiceFallbackMethod;
    if (args.smsUrl) purchaseOptions.smsUrl = args.smsUrl;
    if (args.smsMethod) purchaseOptions.smsMethod = args.smsMethod;
    if (args.smsFallbackUrl) purchaseOptions.smsFallbackUrl = args.smsFallbackUrl;
    if (args.smsFallbackMethod) purchaseOptions.smsFallbackMethod = args.smsFallbackMethod;
    if (args.statusCallback) purchaseOptions.statusCallback = args.statusCallback;
    if (args.statusCallbackMethod) purchaseOptions.statusCallbackMethod = args.statusCallbackMethod;
    if (args.voiceCallerIdLookup !== undefined) purchaseOptions.voiceCallerIdLookup = args.voiceCallerIdLookup;
    if (args.voiceApplicationSid) purchaseOptions.voiceApplicationSid = args.voiceApplicationSid;
    if (args.smsApplicationSid) purchaseOptions.smsApplicationSid = args.smsApplicationSid;
    if (args.addressSid) purchaseOptions.addressSid = args.addressSid;
    if (args.emergencyStatus) purchaseOptions.emergencyStatus = args.emergencyStatus;
    if (args.emergencyAddressSid) purchaseOptions.emergencyAddressSid = args.emergencyAddressSid;
    if (args.trunkSid) purchaseOptions.trunkSid = args.trunkSid;
    if (args.identitySid) purchaseOptions.identitySid = args.identitySid;

    const purchasedNumber = await this.twilio.incomingPhoneNumbers.create(purchaseOptions);

    return {
      success: true,
      action: 'purchase',
      phoneNumberSid: purchasedNumber.sid,
      accountSid: purchasedNumber.accountSid,
      phoneNumber: purchasedNumber.phoneNumber,
      friendlyName: purchasedNumber.friendlyName,
      capabilities: purchasedNumber.capabilities,
      statusCallback: purchasedNumber.statusCallback,
      dateCreated: purchasedNumber.dateCreated,
      dateUpdated: purchasedNumber.dateUpdated
    };
  }

  private async listPhoneNumbers(args: any): Promise<any> {
    const listOptions: any = {};
    if (args.limit) listOptions.limit = args.limit;

    const phoneNumbers = await this.twilio.incomingPhoneNumbers.list(listOptions);

    return {
      success: true,
      action: 'list',
      phoneNumbers: phoneNumbers.map((num: any) => ({
        sid: num.sid,
        phoneNumber: num.phoneNumber,
        friendlyName: num.friendlyName,
        capabilities: num.capabilities,
        status: num.status,
        voiceUrl: num.voiceUrl,
        smsUrl: num.smsUrl,
        dateCreated: num.dateCreated,
        dateUpdated: num.dateUpdated
      })),
      totalNumbers: phoneNumbers.length
    };
  }

  private async updatePhoneNumber(args: any): Promise<any> {
    const updateOptions: any = {};

    if (args.friendlyName) updateOptions.friendlyName = args.friendlyName;
    if (args.voiceUrl) updateOptions.voiceUrl = args.voiceUrl;
    if (args.voiceMethod) updateOptions.voiceMethod = args.voiceMethod;
    if (args.voiceFallbackUrl) updateOptions.voiceFallbackUrl = args.voiceFallbackUrl;
    if (args.voiceFallbackMethod) updateOptions.voiceFallbackMethod = args.voiceFallbackMethod;
    if (args.smsUrl) updateOptions.smsUrl = args.smsUrl;
    if (args.smsMethod) updateOptions.smsMethod = args.smsMethod;
    if (args.smsFallbackUrl) updateOptions.smsFallbackUrl = args.smsFallbackUrl;
    if (args.smsFallbackMethod) updateOptions.smsFallbackMethod = args.smsFallbackMethod;
    if (args.statusCallback) updateOptions.statusCallback = args.statusCallback;
    if (args.statusCallbackMethod) updateOptions.statusCallbackMethod = args.statusCallbackMethod;
    if (args.voiceCallerIdLookup !== undefined) updateOptions.voiceCallerIdLookup = args.voiceCallerIdLookup;
    if (args.voiceReceiveMode) updateOptions.voiceReceiveMode = args.voiceReceiveMode;
    if (args.voiceApplicationSid) updateOptions.voiceApplicationSid = args.voiceApplicationSid;
    if (args.smsApplicationSid) updateOptions.smsApplicationSid = args.smsApplicationSid;
    if (args.emergencyStatus) updateOptions.emergencyStatus = args.emergencyStatus;
    if (args.emergencyAddressSid) updateOptions.emergencyAddressSid = args.emergencyAddressSid;
    if (args.trunkSid) updateOptions.trunkSid = args.trunkSid;

    const updatedNumber = await this.twilio.incomingPhoneNumbers(args.phoneNumber).update(updateOptions);

    return {
      success: true,
      action: 'update',
      phoneNumberSid: updatedNumber.sid,
      phoneNumber: updatedNumber.phoneNumber,
      friendlyName: updatedNumber.friendlyName,
      capabilities: updatedNumber.capabilities,
      dateUpdated: updatedNumber.dateUpdated
    };
  }

  private async releasePhoneNumber(args: any): Promise<any> {
    await this.twilio.incomingPhoneNumbers(args.phoneNumber).remove();

    return {
      success: true,
      action: 'release',
      phoneNumber: args.phoneNumber,
      message: 'Phone number released successfully'
    };
  }

  // Conversation execution
  async executeConversation(args: any): Promise<any> {
    try {
      console.log(`💬 Conversation action: ${args.action}`);
      
      switch (args.action) {
        case 'create':
          return await this.createConversation(args);
        case 'list':
          return await this.listConversations(args);
        case 'get':
          return await this.getConversation(args);
        case 'update':
          return await this.updateConversation(args);
        case 'delete':
          return await this.deleteConversation(args);
        case 'add_participant':
          return await this.addParticipant(args);
        case 'remove_participant':
          return await this.removeParticipant(args);
        case 'send_message':
          return await this.sendConversationMessage(args);
        default:
          throw new Error(`Unknown conversation action: ${args.action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Conversation operation failed:", error);
      return {
        success: false,
        error: `Conversation operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async createConversation(args: any): Promise<any> {
    const conversationOptions: any = {};

    if (args.friendlyName) conversationOptions.friendlyName = args.friendlyName;
    if (args.uniqueName) conversationOptions.uniqueName = args.uniqueName;
    if (args.attributes) conversationOptions.attributes = args.attributes;
    if (args.messagingServiceSid) conversationOptions.messagingServiceSid = args.messagingServiceSid;
    if (args.state) conversationOptions.state = args.state;
    if (args.timers) conversationOptions.timers = args.timers;
    if (args.bindings) conversationOptions.bindings = args.bindings;

    const conversation = await this.twilio.conversations.conversations.create(conversationOptions);

    return {
      success: true,
      action: 'create',
      conversationSid: conversation.sid,
      accountSid: conversation.accountSid,
      chatServiceSid: conversation.chatServiceSid,
      friendlyName: conversation.friendlyName,
      uniqueName: conversation.uniqueName,
      attributes: conversation.attributes,
      state: conversation.state,
      messagingServiceSid: conversation.messagingServiceSid,
      dateCreated: conversation.dateCreated,
      dateUpdated: conversation.dateUpdated,
      url: conversation.url,
      links: conversation.links
    };
  }

  private async listConversations(args: any): Promise<any> {
    const listOptions: any = {};
    if (args.limit) listOptions.limit = args.limit;

    const conversations = await this.twilio.conversations.conversations.list(listOptions);

    return {
      success: true,
      action: 'list',
      conversations: conversations.map((conv: any) => ({
        sid: conv.sid,
        friendlyName: conv.friendlyName,
        uniqueName: conv.uniqueName,
        state: conv.state,
        dateCreated: conv.dateCreated,
        dateUpdated: conv.dateUpdated
      })),
      totalConversations: conversations.length
    };
  }

  private async getConversation(args: any): Promise<any> {
    const conversation = await this.twilio.conversations.conversations(args.conversationSid).fetch();

    return {
      success: true,
      action: 'get',
      conversationSid: conversation.sid,
      friendlyName: conversation.friendlyName,
      uniqueName: conversation.uniqueName,
      attributes: conversation.attributes,
      state: conversation.state,
      messagingServiceSid: conversation.messagingServiceSid,
      dateCreated: conversation.dateCreated,
      dateUpdated: conversation.dateUpdated,
      url: conversation.url,
      links: conversation.links
    };
  }

  private async updateConversation(args: any): Promise<any> {
    const updateOptions: any = {};

    if (args.friendlyName) updateOptions.friendlyName = args.friendlyName;
    if (args.attributes) updateOptions.attributes = args.attributes;
    if (args.state) updateOptions.state = args.state;
    if (args.timers) updateOptions.timers = args.timers;

    const conversation = await this.twilio.conversations.conversations(args.conversationSid).update(updateOptions);

    return {
      success: true,
      action: 'update',
      conversationSid: conversation.sid,
      friendlyName: conversation.friendlyName,
      attributes: conversation.attributes,
      state: conversation.state,
      dateUpdated: conversation.dateUpdated
    };
  }

  private async deleteConversation(args: any): Promise<any> {
    await this.twilio.conversations.conversations(args.conversationSid).remove();

    return {
      success: true,
      action: 'delete',
      conversationSid: args.conversationSid,
      message: 'Conversation deleted successfully'
    };
  }

  private async addParticipant(args: any): Promise<any> {
    const participantOptions: any = {};

    if (args.participantIdentity) participantOptions.identity = args.participantIdentity;
    if (args.participantAddress) {
      participantOptions['messagingBinding.address'] = args.participantAddress;
      if (args.participantProxyAddress) {
        participantOptions['messagingBinding.proxyAddress'] = args.participantProxyAddress;
      }
    }
    if (args.participantAttributes) participantOptions.attributes = args.participantAttributes;
    if (args.participantRoleSid) participantOptions.roleSid = args.participantRoleSid;

    const participant = await this.twilio.conversations.conversations(args.conversationSid).participants.create(participantOptions);

    return {
      success: true,
      action: 'add_participant',
      conversationSid: args.conversationSid,
      participantSid: participant.sid,
      identity: participant.identity,
      attributes: participant.attributes,
      roleSid: participant.roleSid,
      dateCreated: participant.dateCreated,
      dateUpdated: participant.dateUpdated
    };
  }

  private async removeParticipant(args: any): Promise<any> {
    await this.twilio.conversations.conversations(args.conversationSid).participants(args.participantIdentity).remove();

    return {
      success: true,
      action: 'remove_participant',
      conversationSid: args.conversationSid,
      participantIdentity: args.participantIdentity,
      message: 'Participant removed successfully'
    };
  }

  private async sendConversationMessage(args: any): Promise<any> {
    const messageOptions: any = {};

    if (args.messageBody) messageOptions.body = args.messageBody;
    if (args.messageAuthor) messageOptions.author = args.messageAuthor;
    if (args.messageMediaSid) messageOptions.mediaSid = args.messageMediaSid;
    if (args.messageAttributes) messageOptions.attributes = args.messageAttributes;
    if (args.messageContentSid) messageOptions.contentSid = args.messageContentSid;
    if (args.messageContentVariables) messageOptions.contentVariables = args.messageContentVariables;

    const message = await this.twilio.conversations.conversations(args.conversationSid).messages.create(messageOptions);

    return {
      success: true,
      action: 'send_message',
      conversationSid: args.conversationSid,
      messageSid: message.sid,
      author: message.author,
      body: message.body,
      attributes: message.attributes,
      participantSid: message.participantSid,
      dateCreated: message.dateCreated,
      dateUpdated: message.dateUpdated
    };
  }

  // Fax execution
  async executeFax(args: any): Promise<any> {
    try {
      console.log(`📠 Sending fax to ${args.to}`);
      
      const faxOptions: any = {
        to: args.to,
        from: args.from,
        mediaUrl: args.mediaUrl
      };

      if (args.quality) faxOptions.quality = args.quality;
      if (args.statusCallback) faxOptions.statusCallback = args.statusCallback;
      if (args.statusCallbackMethod) faxOptions.statusCallbackMethod = args.statusCallbackMethod;
      if (args.storeMedia !== undefined) faxOptions.storeMedia = args.storeMedia;
      if (args.ttl) faxOptions.ttl = args.ttl;
      if (args.sipAuthUsername) faxOptions.sipAuthUsername = args.sipAuthUsername;
      if (args.sipAuthPassword) faxOptions.sipAuthPassword = args.sipAuthPassword;

      const fax = await this.twilio.fax.faxes.create(faxOptions);

      return {
        success: true,
        faxSid: fax.sid,
        accountSid: fax.accountSid,
        to: fax.to,
        from: fax.from,
        mediaUrl: fax.mediaUrl,
        mediaSid: fax.mediaSid,
        status: fax.status,
        direction: fax.direction,
        apiVersion: fax.apiVersion,
        price: fax.price,
        priceUnit: fax.priceUnit,
        duration: fax.duration,
        quality: fax.quality,
        dateCreated: fax.dateCreated,
        dateUpdated: fax.dateUpdated,
        url: fax.url
      };

    } catch (error: unknown) {
      console.error("❌ Fax sending failed:", error);
      return {
        success: false,
        error: `Fax sending failed: ${error instanceof Error ? error.message : String(error)}`,
        to: args.to,
        from: args.from
      };
    }
  }

  // Phone lookup execution
  async executeLookup(args: any): Promise<any> {
    try {
      console.log(`🔍 Looking up phone number: ${args.phoneNumber}`);
      
      const lookupOptions: any = {};

      if (args.countryCode) lookupOptions.countryCode = args.countryCode;
      if (args.type) lookupOptions.type = args.type;
      if (args.addOns) lookupOptions.addOns = args.addOns;
      if (args.addOnsData) lookupOptions.addOnsData = args.addOnsData;
      if (args.fields) lookupOptions.fields = args.fields;

      // Identity match parameters
      if (args.firstName) lookupOptions.firstName = args.firstName;
      if (args.lastName) lookupOptions.lastName = args.lastName;
      if (args.addressLine1) lookupOptions.addressLine1 = args.addressLine1;
      if (args.city) lookupOptions.city = args.city;
      if (args.state) lookupOptions.state = args.state;
      if (args.postalCode) lookupOptions.postalCode = args.postalCode;
      if (args.addressCountryCode) lookupOptions.addressCountryCode = args.addressCountryCode;
      if (args.nationalId) lookupOptions.nationalId = args.nationalId;
      if (args.dateOfBirth) lookupOptions.dateOfBirth = args.dateOfBirth;

      const phoneNumber = await this.twilio.lookups.phoneNumbers(args.phoneNumber).fetch(lookupOptions);

      return {
        success: true,
        phoneNumber: phoneNumber.phoneNumber,
        countryCode: phoneNumber.countryCode,
        nationalFormat: phoneNumber.nationalFormat,
        carrier: phoneNumber.carrier,
        callerName: phoneNumber.callerName,
        addOns: phoneNumber.addOns,
        url: phoneNumber.url,
        smsPumpingRisk: phoneNumber.smsPumpingRisk,
        callForwarding: phoneNumber.callForwarding,
        lineTypeIntelligence: phoneNumber.lineTypeIntelligence,
        identityMatch: phoneNumber.identityMatch,
        reassignedNumber: phoneNumber.reassignedNumber,
        simSwap: phoneNumber.simSwap
      };

    } catch (error: unknown) {
      console.error("❌ Phone lookup failed:", error);
      return {
        success: false,
        error: `Phone lookup failed: ${error instanceof Error ? error.message : String(error)}`,
        phoneNumber: args.phoneNumber
      };
    }
  }

  // Verify execution
  async executeVerify(args: any): Promise<any> {
    try {
      console.log(`🔐 Verification action: ${args.action}`);
      
      switch (args.action) {
        case 'start_verification':
          return await this.startVerification(args);
        case 'check_verification':
          return await this.checkVerification(args);
        case 'create_service':
          return await this.createVerifyService(args);
        case 'update_service':
          return await this.updateVerifyService(args);
        case 'list_services':
          return await this.listVerifyServices(args);
        default:
          throw new Error(`Unknown verify action: ${args.action}`);
      }

    } catch (error: unknown) {
      console.error("❌ Verification operation failed:", error);
      return {
        success: false,
        error: `Verification operation failed: ${error instanceof Error ? error.message : String(error)}`,
        action: args.action
      };
    }
  }

  private async startVerification(args: any): Promise<any> {
    const verificationOptions: any = {
      to: args.to,
      channel: args.channel || 'sms'
    };

    if (args.customFriendlyName) verificationOptions.customFriendlyName = args.customFriendlyName;
    if (args.customMessage) verificationOptions.customMessage = args.customMessage;
    if (args.customCodeLength) verificationOptions.customCodeLength = args.customCodeLength;
    if (args.locale) verificationOptions.locale = args.locale;
    if (args.customCode) verificationOptions.customCode = args.customCode;
    if (args.amount) verificationOptions.amount = args.amount;
    if (args.payee) verificationOptions.payee = args.payee;
    if (args.templateSid) verificationOptions.templateSid = args.templateSid;
    if (args.templateCustomSubstitutions) verificationOptions.templateCustomSubstitutions = args.templateCustomSubstitutions;
    if (args.deviceIp) verificationOptions.deviceIp = args.deviceIp;
    if (args.riskCheck) verificationOptions.riskCheck = args.riskCheck;
    if (args.tags) verificationOptions.tags = args.tags;

    const verification = await this.twilio.verify.services(args.serviceSid).verifications.create(verificationOptions);

    return {
      success: true,
      action: 'start_verification',
      serviceSid: args.serviceSid,
      sid: verification.sid,
      accountSid: verification.accountSid,
      to: verification.to,
      channel: verification.channel,
      status: verification.status,
      valid: verification.valid,
      lookup: verification.lookup,
      amount: verification.amount,
      payee: verification.payee,
      sendCodeAttempts: verification.sendCodeAttempts,
      dateCreated: verification.dateCreated,
      dateUpdated: verification.dateUpdated,
      sna: verification.sna,
      url: verification.url
    };
  }

  private async checkVerification(args: any): Promise<any> {
    const checkOptions: any = {
      code: args.code
    };

    if (args.amount) checkOptions.amount = args.amount;
    if (args.payee) checkOptions.payee = args.payee;

    const verificationCheck = await this.twilio.verify.services(args.serviceSid).verificationChecks.create({
      to: args.to,
      ...checkOptions
    });

    return {
      success: true,
      action: 'check_verification',
      serviceSid: args.serviceSid,
      sid: verificationCheck.sid,
      accountSid: verificationCheck.accountSid,
      to: verificationCheck.to,
      channel: verificationCheck.channel,
      status: verificationCheck.status,
      valid: verificationCheck.valid,
      amount: verificationCheck.amount,
      payee: verificationCheck.payee,
      dateCreated: verificationCheck.dateCreated,
      dateUpdated: verificationCheck.dateUpdated
    };
  }

  private async createVerifyService(args: any): Promise<any> {
    const serviceOptions: any = {
      friendlyName: args.customFriendlyName || 'Verification Service'
    };

    if (args.codeLength) serviceOptions.codeLength = args.codeLength;
    if (args.lookupEnabled !== undefined) serviceOptions.lookupEnabled = args.lookupEnabled;
    if (args.psd2Enabled !== undefined) serviceOptions.psd2Enabled = args.psd2Enabled;
    if (args.skipSmsToLandlines !== undefined) serviceOptions.skipSmsToLandlines = args.skipSmsToLandlines;
    if (args.dtmfInputRequired !== undefined) serviceOptions.dtmfInputRequired = args.dtmfInputRequired;
    if (args.ttsName) serviceOptions.ttsName = args.ttsName;
    if (args.mailerSid) serviceOptions.mailerSid = args.mailerSid;
    if (args.customCodeLength) serviceOptions.codeLength = args.customCodeLength;

    const service = await this.twilio.verify.services.create(serviceOptions);

    return {
      success: true,
      action: 'create_service',
      serviceSid: service.sid,
      accountSid: service.accountSid,
      friendlyName: service.friendlyName,
      codeLength: service.codeLength,
      lookupEnabled: service.lookupEnabled,
      psd2Enabled: service.psd2Enabled,
      skipSmsToLandlines: service.skipSmsToLandlines,
      dtmfInputRequired: service.dtmfInputRequired,
      ttsName: service.ttsName,
      dateCreated: service.dateCreated,
      dateUpdated: service.dateUpdated,
      url: service.url
    };
  }

  private async updateVerifyService(args: any): Promise<any> {
    const updateOptions: any = {};

    if (args.customFriendlyName) updateOptions.friendlyName = args.customFriendlyName;
    if (args.codeLength) updateOptions.codeLength = args.codeLength;
    if (args.lookupEnabled !== undefined) updateOptions.lookupEnabled = args.lookupEnabled;
    if (args.psd2Enabled !== undefined) updateOptions.psd2Enabled = args.psd2Enabled;
    if (args.skipSmsToLandlines !== undefined) updateOptions.skipSmsToLandlines = args.skipSmsToLandlines;
    if (args.dtmfInputRequired !== undefined) updateOptions.dtmfInputRequired = args.dtmfInputRequired;
    if (args.ttsName) updateOptions.ttsName = args.ttsName;

    const service = await this.twilio.verify.services(args.serviceSid).update(updateOptions);

    return {
      success: true,
      action: 'update_service',
      serviceSid: service.sid,
      friendlyName: service.friendlyName,
      codeLength: service.codeLength,
      lookupEnabled: service.lookupEnabled,
      psd2Enabled: service.psd2Enabled,
      skipSmsToLandlines: service.skipSmsToLandlines,
      dtmfInputRequired: service.dtmfInputRequired,
      ttsName: service.ttsName,
      dateUpdated: service.dateUpdated
    };
  }

  private async listVerifyServices(args: any): Promise<any> {
    const listOptions: any = {};
    if (args.limit) listOptions.limit = args.limit;

    const services = await this.twilio.verify.services.list(listOptions);

    return {
      success: true,
      action: 'list_services',
      services: services.map((service: any) => ({
        sid: service.sid,
        friendlyName: service.friendlyName,
        codeLength: service.codeLength,
        lookupEnabled: service.lookupEnabled,
        psd2Enabled: service.psd2Enabled,
        skipSmsToLandlines: service.skipSmsToLandlines,
        dtmfInputRequired: service.dtmfInputRequired,
        dateCreated: service.dateCreated,
        dateUpdated: service.dateUpdated
      })),
      totalServices: services.length
    };
  }

  // Convenience methods for backward compatibility and ease of use
  async sendSMS(to: string, body: string, from?: string, options: any = {}): Promise<any> {
    return this.executeSMS({ to, body, from, ...options });
  }

  async sendWhatsApp(to: string, from: string, body?: string, options: any = {}): Promise<any> {
    return this.executeWhatsApp({ to, from, body, ...options });
  }

  async makeCall(to: string, from: string, url?: string, twiml?: string, options: any = {}): Promise<any> {
    return this.executeVoiceCall({ to, from, url, twiml, ...options });
  }

  async createVideoRoom(uniqueName?: string, options: any = {}): Promise<any> {
    return this.executeVideo({ uniqueName, ...options });
  }

  async searchNumbers(countryCode: string = 'US', criteria: any = {}): Promise<any> {
    return this.executePhoneNumber({ action: 'search', countryCode, ...criteria });
  }

  async purchaseNumber(phoneNumber: string, options: any = {}): Promise<any> {
    return this.executePhoneNumber({ action: 'purchase', phoneNumber, ...options });
  }

  async lookupNumber(phoneNumber: string, options: any = {}): Promise<any> {
    return this.executeLookup({ phoneNumber, ...options });
  }

  async startVerify(serviceSid: string, to: string, channel: string = 'sms', options: any = {}): Promise<any> {
    return this.executeVerify({ action: 'start_verification', serviceSid, to, channel, ...options });
  }

  async checkVerify(serviceSid: string, to: string, code: string, options: any = {}): Promise<any> {
    return this.executeVerify({ action: 'check_verification', serviceSid, to, code, ...options });
  }

  async sendFax(to: string, from: string, mediaUrl: string, options: any = {}): Promise<any> {
    return this.executeFax({ to, from, mediaUrl, ...options });
  }

  async createConvo(friendlyName?: string, options: any = {}): Promise<any> {
    return this.executeConversation({ action: 'create', friendlyName, ...options });
  }

  // Utility method to validate phone numbers
  validatePhoneNumber(phoneNumber: string): boolean {
    // Basic E.164 format validation
    const e164Regex = /^\+[1-9]\d{1,14}$/;
    return e164Regex.test(phoneNumber);
  }

  // Utility method to format phone numbers to E.164
  formatToE164(phoneNumber: string, countryCode: string = 'US'): string {
    // Remove all non-digit characters
    const cleaned = phoneNumber.replace(/\D/g, '');
    
    // Add country code if not present
    if (countryCode === 'US' && cleaned.length === 10) {
      return `+1${cleaned}`;
    } else if (countryCode === 'US' && cleaned.length === 11 && cleaned.startsWith('1')) {
      return `+${cleaned}`;
    } else if (!cleaned.startsWith('+')) {
      // For other countries, you'd need more sophisticated logic
      return `+${cleaned}`;
    }
    
    return cleaned.startsWith('+') ? cleaned : `+${cleaned}`;
  }

  // Utility method to format WhatsApp numbers
  formatWhatsAppNumber(phoneNumber: string): string {
    const e164 = this.formatToE164(phoneNumber);
    return `whatsapp:${e164}`;
  }

  // Method to get account information
  async getAccountInfo(): Promise<any> {
    try {
      const account = await this.twilio.api.accounts(this.accountSid).fetch();
      
      return {
        success: true,
        accountSid: account.sid,
        friendlyName: account.friendlyName,
        status: account.status,
        type: account.type,
        dateCreated: account.dateCreated,
        dateUpdated: account.dateUpdated,
        authToken: '[HIDDEN]', // Never expose auth token
        uri: account.uri
      };
    } catch (error: unknown) {
      console.error("❌ Failed to get account info:", error);
      return {
        success: false,
        error: `Failed to get account info: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }

  // Method to get usage records
  async getUsage(category?: string, startDate?: string, endDate?: string): Promise<any> {
    try {
      const usageOptions: any = {};
      if (category) usageOptions.category = category;
      if (startDate) usageOptions.startDate = new Date(startDate);
      if (endDate) usageOptions.endDate = new Date(endDate);

      const usageRecords = await this.twilio.usage.records.list(usageOptions);

      return {
        success: true,
        usageRecords: usageRecords.map((record: any) => ({
          category: record.category,
          description: record.description,
          accountSid: record.accountSid,
          period: record.period,
          count: record.count,
          countUnit: record.countUnit,
          usage: record.usage,
          usageUnit: record.usageUnit,
          price: record.price,
          priceUnit: record.priceUnit,
          apiVersion: record.apiVersion,
          uri: record.uri
        })),
        totalRecords: usageRecords.length
      };
    } catch (error: unknown) {
      console.error("❌ Failed to get usage records:", error);
      return {
        success: false,
        error: `Failed to get usage records: ${error instanceof Error ? error.message : String(error)}`
      };
    }
  }
}

package services

import (
	"time"

	"github.com/VeryGreenCat/AutoTrader/backend/internal/config"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/handlers/dto"
	"github.com/VeryGreenCat/AutoTrader/backend/internal/models"
	"github.com/google/uuid"
)

func GetAvailableModels() ([]models.Model, error) {
	var models []models.Model
	if err := config.DB.Find(&models).Error; err != nil {
		return nil, err
	}
	return models, nil
}

func UpsertModel(req *dto.RegisterModelRequest) (*models.Model, error) {
	var model models.Model

	// Find if exists
	err := config.DB.Where("name = ? AND version = ? AND currency = ?", req.Name, req.Version, req.Currency).First(&model).Error

	if err == nil {
		// Update description if changed
		if req.Description != "" {
			model.Description = req.Description
			if err := config.DB.Save(&model).Error; err != nil {
				return nil, err
			}
		}
		return &model, nil
	}

	// Create new
	newModel := models.Model{
		ModelID:     uuid.New().String(),
		Name:        req.Name,
		Version:     req.Version,
		Currency:    req.Currency,
		Description: req.Description,
		Created:     time.Now(),
	}

	if err := config.DB.Create(&newModel).Error; err != nil {
		return nil, err
	}

	return &newModel, nil
}
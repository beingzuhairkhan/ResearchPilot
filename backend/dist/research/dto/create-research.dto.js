"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.CreateResearchDto = void 0;
const class_validator_1 = require("class-validator");
const research_mode_enum_1 = require("../../common/enums/research-mode.enum");
const swagger_1 = require("@nestjs/swagger");
class CreateResearchDto {
}
exports.CreateResearchDto = CreateResearchDto;
__decorate([
    (0, swagger_1.ApiProperty)({ example: 'Research the current adoption of Generative AI in Indian IT companies' }),
    (0, class_validator_1.IsString)(),
    __metadata("design:type", String)
], CreateResearchDto.prototype, "question", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ enum: research_mode_enum_1.ResearchMode, default: research_mode_enum_1.ResearchMode.DEEP }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsEnum)(research_mode_enum_1.ResearchMode),
    __metadata("design:type", String)
], CreateResearchDto.prototype, "mode", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: 30, minimum: 1, maximum: 50 }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsInt)(),
    (0, class_validator_1.Min)(1),
    (0, class_validator_1.Max)(50),
    __metadata("design:type", Number)
], CreateResearchDto.prototype, "maxSources", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: true }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateResearchDto.prototype, "includeNews", void 0);
__decorate([
    (0, swagger_1.ApiPropertyOptional)({ default: false }),
    (0, class_validator_1.IsOptional)(),
    (0, class_validator_1.IsBoolean)(),
    __metadata("design:type", Boolean)
], CreateResearchDto.prototype, "includeScholar", void 0);
//# sourceMappingURL=create-research.dto.js.map
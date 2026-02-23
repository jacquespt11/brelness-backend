import { ApiProperty } from '@nestjs/swagger';

export class Notification {
    @ApiProperty()
    id: string;

    @ApiProperty()
    type: string;

    @ApiProperty()
    title: string;

    @ApiProperty()
    message: string;

    @ApiProperty()
    isRead: boolean;

    @ApiProperty({ required: false })
    metadata?: Record<string, any>;

    @ApiProperty()
    createdAt: Date;

    @ApiProperty()
    updatedAt: Date;
}
